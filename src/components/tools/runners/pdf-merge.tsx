import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DropZone } from "./image-to-pdf";
import { formatBytes } from "./pdf-compress";

interface PdfItem {
  id: string;
  file: File;
}

export function PdfMergeRunner() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [busy, setBusy] = useState(false);

  const add = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type === "application/pdf");
    setItems((p) => [...p, ...arr.map((f) => ({ id: crypto.randomUUID(), file: f }))]);
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const move = (from: number, to: number) =>
    setItems((p) => {
      const n = [...p];
      const [it] = n.splice(from, 1);
      n.splice(to, 0, it);
      return n;
    });

  const merge = async () => {
    if (items.length < 2) {
      toast.error("Add at least two PDFs to merge");
      return;
    }
    setBusy(true);
    try {
      const out = await PDFDocument.create();
      for (const it of items) {
        const bytes = await it.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await out.copyPages(doc, doc.getPageIndices());
        pages.forEach((p: import("pdf-lib").PDFPage) => out.addPage(p));
      }
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crazytools-merged-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Merged PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <DropZone
        accept="application/pdf"
        label="Drop PDF files or click to select"
        onFiles={add}
      />
      {items.length > 0 && (
        <>
          <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-surface/40">
            {items.map((it, idx) => (
              <li
                key={it.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  if (!Number.isNaN(from)) move(from, idx);
                }}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{it.file.name}</p>
                    <p className="mono text-[11px] text-muted-foreground">
                      {formatBytes(it.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => remove(it.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <button
              onClick={merge}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              {busy ? "Merging…" : `Merge ${items.length} files`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
