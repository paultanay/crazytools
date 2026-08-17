import { useMemo, useState } from "react";
import { marked, type Token, type Tokens } from "marked";
import DOMPurify from "dompurify";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { toast } from "sonner";

const SAMPLE = `# Crazy Tools

**The complete toolkit. In your browser.**

- PDF, image, developer, and text utilities
- Runs locally, no upload required
- Precision-first interface

## Snippet

\`\`\`ts
export const version = "1.0";
\`\`\`

> All processing happens on this device.
`;

marked.setOptions({ gfm: true, breaks: true });

// Text-based PDF renderer: no html2canvas, no CSS color parsing.
function renderMarkdownToPdf(md: string): jsPDF {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const writeText = (
    text: string,
    opts: { size?: number; bold?: boolean; italic?: boolean; indent?: number; mono?: boolean } = {},
  ) => {
    const size = opts.size ?? 11;
    let style: "normal" | "bold" | "italic" | "bolditalic" = "normal";
    if (opts.bold && opts.italic) style = "bolditalic";
    else if (opts.bold) style = "bold";
    else if (opts.italic) style = "italic";
    pdf.setFont(opts.mono ? "courier" : "helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(20, 20, 20);
    const indent = opts.indent ?? 0;
    const lines = pdf.splitTextToSize(text, maxWidth - indent) as string[];
    const lineHeight = size * 1.4;
    for (const line of lines) {
      ensureSpace(lineHeight);
      pdf.text(line, margin + indent, y);
      y += lineHeight;
    }
  };

  const spacer = (h: number) => {
    y += h;
  };

  // Flatten inline tokens into a plain string (bold/italic markers are dropped
  // to keep text-mode rendering reliable; formatting is preserved for headings/code).
  const inlineText = (tokens: Token[] | undefined): string => {
    if (!tokens) return "";
    return tokens
      .map((t) => {
        const anyT = t as { text?: string; tokens?: Token[]; type?: string };
        if (anyT.type === "codespan" && anyT.text) return anyT.text;
        if (anyT.tokens) return inlineText(anyT.tokens);
        return anyT.text ?? "";
      })
      .join("");
  };

  const tokens = marked.lexer(md);

  const walk = (tok: Token) => {
    switch (tok.type) {
      case "heading": {
        const h = tok as Tokens.Heading;
        const size = h.depth === 1 ? 22 : h.depth === 2 ? 17 : 14;
        spacer(8);
        writeText(inlineText(h.tokens), { size, bold: true });
        spacer(4);
        break;
      }
      case "paragraph": {
        const p = tok as Tokens.Paragraph;
        writeText(inlineText(p.tokens), { size: 11 });
        spacer(6);
        break;
      }
      case "blockquote": {
        const q = tok as Tokens.Blockquote;
        const text = q.tokens.map((t) => inlineText((t as Tokens.Paragraph).tokens)).join(" ");
        writeText(text, { size: 11, italic: true, indent: 16 });
        spacer(6);
        break;
      }
      case "list": {
        const l = tok as Tokens.List;
        l.items.forEach((it, i) => {
          const bullet = l.ordered ? `${i + 1}.` : "•";
          const text = inlineText(it.tokens as Token[]);
          writeText(`${bullet}  ${text}`, { size: 11, indent: 12 });
        });
        spacer(6);
        break;
      }
      case "code": {
        const c = tok as Tokens.Code;
        const lines = c.text.split("\n");
        for (const line of lines) {
          writeText(line || " ", { size: 10, mono: true, indent: 8 });
        }
        spacer(8);
        break;
      }
      case "hr":
        ensureSpace(20);
        pdf.setDrawColor(200);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 16;
        break;
      case "space":
        spacer(4);
        break;
      case "table": {
        const t = tok as Tokens.Table;
        const header = t.header.map((c) => inlineText(c.tokens)).join(" | ");
        writeText(header, { size: 11, bold: true });
        t.rows.forEach((row) => {
          const line = row.map((c) => inlineText(c.tokens)).join(" | ");
          writeText(line, { size: 10 });
        });
        spacer(6);
        break;
      }
      default: {
        const anyT = tok as { raw?: string };
        if (anyT.raw) writeText(anyT.raw, { size: 11 });
      }
    }
  };

  tokens.forEach(walk);
  return pdf;
}

export function MarkdownToPdfRunner() {
  const [md, setMd] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);

  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md) as string), [md]);

  const buildPdf = async () => {
    setBusy(true);
    try {
      const pdf = renderMarkdownToPdf(md);
      pdf.save(`crazytools-md-${Date.now()}.pdf`);
      toast.success("PDF exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          spellCheck={false}
          className="mono min-h-[520px] w-full resize-none rounded-lg border border-hairline bg-card p-4 text-[13px] leading-relaxed outline-none focus:border-foreground/40"
        />
        <div
          className="prose-preview min-h-[520px] overflow-auto rounded-lg border border-hairline bg-white p-6 text-[13px] leading-relaxed"
          style={{ color: "#111" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={buildPdf}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" strokeWidth={1.75} />
          {busy ? "Rendering…" : "Export PDF"}
        </button>
      </div>
      <style>{`
        .prose-preview h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
        .prose-preview h2 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; }
        .prose-preview h3 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; }
        .prose-preview p { margin: 0 0 10px; }
        .prose-preview code { font-family: "JetBrains Mono Variable", monospace; background: #f2f2f2; padding: 1px 4px; border-radius: 3px; }
        .prose-preview pre { background: #111; color: #eee; padding: 10px; border-radius: 6px; overflow: auto; font-family: "JetBrains Mono Variable", monospace; font-size: 12px; }
        .prose-preview blockquote { border-left: 3px solid #ccc; padding: 2px 0 2px 10px; color: #555; margin: 0 0 10px; }
        .prose-preview ul, .prose-preview ol { padding-left: 20px; margin: 0 0 10px; }
        .prose-preview a { color: #0a5cff; }
        .prose-preview table { border-collapse: collapse; margin: 0 0 10px; }
        .prose-preview th, .prose-preview td { border: 1px solid #ddd; padding: 4px 8px; }
      `}</style>
    </div>
  );
}
