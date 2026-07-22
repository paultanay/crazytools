import { useState } from "react";
import { Download, Info } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { DropZone } from "./image-to-pdf";

export function PdfCompressRunner() {
  const [file, setFile] = useState<File | null>(null);
  const [outSize, setOutSize] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { updateMetadata: false });
      // Re-save with object stream compression — pdf-lib enables stream compression by default.
      const out = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      setOutSize(out.byteLength);
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF compressed and downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <DropZone
        multiple={false}
        accept="application/pdf"
        label={file ? file.name : "Drop a PDF or click to select"}
        onFiles={(f) => {
          const arr = Array.from(f);
          if (arr[0]) setFile(arr[0]);
        }}
      />
      {file && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-hairline bg-surface/40 p-4">
          <div className="mono flex flex-col text-[12px] text-muted-foreground">
            <span>Input: {formatBytes(file.size)}</span>
            {outSize !== null && (
              <span className="text-primary">
                Output: {formatBytes(outSize)} · saved {saved(file.size, outSize)}
              </span>
            )}
          </div>
          <button
            onClick={run}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            {busy ? "Compressing…" : "Compress"}
          </button>
        </div>
      )}
      <p className="mono flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 flex-none" />
        Compression preserves text layers, links, and metadata. Image-heavy documents yield the largest reductions.
      </p>
    </div>
  );
}

export function formatBytes(n: number) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}

function saved(before: number, after: number) {
  if (before === 0) return "0%";
  const pct = ((before - after) / before) * 100;
  return `${pct > 0 ? pct.toFixed(1) : "0"}%`;
}
