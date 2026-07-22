import { useState } from "react";
import { Upload, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LANGS = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
  { code: "rus", name: "Russian" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "ara", name: "Arabic" },
  { code: "hin", name: "Hindi" },
];

export function OcrRunner() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const onFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setText("");
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setText("");
    try {
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(file, lang, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      setText(result.data.text);
      toast.success("Text extracted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "OCR failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline bg-surface/40 p-6 text-center transition-colors hover:border-foreground/40">
          {imageUrl ? (
            <img src={imageUrl} alt="OCR source" className="max-h-[360px] rounded-md" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">
                Drop or select an image (PNG, JPG, WebP)
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1">
            <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Language
            </span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-md border border-hairline bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={run}
            disabled={!file || busy}
            className="inline-flex h-9 items-center gap-2 self-end rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? `${progress}%` : "Extract text"}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Output · {text.length} chars
          </div>
          <button
            onClick={copy}
            disabled={!text}
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs hover:bg-accent disabled:opacity-50"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Extracted text will appear here…"
          className="mono min-h-[420px] w-full rounded-md border border-hairline bg-background p-3 text-[13px] outline-none focus:border-primary/50"
        />
      </div>
    </div>
  );
}
