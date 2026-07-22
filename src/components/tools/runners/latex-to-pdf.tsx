import { useState } from "react";
import { Download, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { compileLatex } from "@/lib/tools/latex.functions";

const SAMPLE = String.raw`\documentclass{article}
\usepackage[margin=1in]{geometry}
\usepackage{amsmath}

\title{Hello from Crazy Tools}
\author{You}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}
This PDF was compiled from LaTeX in your browser via a hosted TeX engine.

\section{Math}
\begin{equation}
  e^{i\pi} + 1 = 0
\end{equation}

\end{document}
`;

export function LatexToPdfRunner() {
  const [source, setSource] = useState(SAMPLE);
  const [compiler, setCompiler] = useState<"pdflatex" | "xelatex" | "lualatex">("pdflatex");
  const [busy, setBusy] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [logs, setLogs] = useState<string>("");
  const compile = useServerFn(compileLatex);

  const run = async () => {
    setBusy(true);
    setLogs("");
    try {
      const result = await compile({ data: { source, compiler } });
      if (!result.ok) {
        setLogs(result.error);
        toast.error("Compilation failed. Check logs.");
        return;
      }
      const bin = atob(result.pdfBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      toast.success("Compiled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compilation failed");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `document-${Date.now()}.pdf`;
    a.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
            LaTeX source
          </div>
          <select
            value={compiler}
            onChange={(e) => setCompiler(e.target.value as typeof compiler)}
            className="rounded-md border border-hairline bg-background px-2 py-1 text-xs outline-none focus:border-primary/50"
          >
            <option value="pdflatex">pdflatex</option>
            <option value="xelatex">xelatex</option>
            <option value="lualatex">lualatex</option>
          </select>
        </div>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          className="mono min-h-[440px] w-full rounded-md border border-hairline bg-background p-3 text-[12px] outline-none focus:border-primary/50"
        />
        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={busy || !source.trim()}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Compile
          </button>
          <button
            onClick={download}
            disabled={!pdfUrl}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline px-4 text-sm hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Preview
        </div>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF preview"
            className="h-[540px] w-full rounded-md border border-hairline bg-white"
          />
        ) : (
          <div className="flex h-[540px] items-center justify-center rounded-md border border-hairline bg-surface/40 text-sm text-muted-foreground">
            Compile to preview
          </div>
        )}
        {logs && (
          <pre className="mono max-h-[200px] overflow-auto rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[11px] text-destructive">
            {logs}
          </pre>
        )}
      </div>
    </div>
  );
}
