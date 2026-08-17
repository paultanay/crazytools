import { useCallback, useEffect, useState } from "react";
import {
  Upload,
  Download,
  X,
  GripVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

export function ImageToPdfRunner() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [busy, setBusy] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const items = arr.map(
      (file) =>
        new Promise<ImageItem>((resolve, reject) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () =>
            resolve({
              id: crypto.randomUUID(),
              file,
              url,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          img.onerror = reject;
          img.src = url;
        }),
    );
    Promise.all(items).then((loaded) => setImages((prev) => [...prev, ...loaded]));
  }, []);

  const remove = (id: string) => {
    setImages((prev) => {
      const idxToRemove = prev.findIndex((i) => i.id === id);
      const target = prev[idxToRemove];
      if (target) URL.revokeObjectURL(target.url);

      const next = prev.filter((i) => i.id !== id);

      if (previewIndex !== null) {
        if (idxToRemove === previewIndex) {
          setPreviewIndex(next.length > 0 ? Math.min(previewIndex, next.length - 1) : null);
        } else if (idxToRemove < previewIndex) {
          setPreviewIndex(previewIndex - 1);
        }
      }
      return next;
    });
  };

  const move = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
    if (previewIndex !== null) {
      if (previewIndex === from) {
        setPreviewIndex(to);
      } else if (from < previewIndex && to >= previewIndex) {
        setPreviewIndex(previewIndex - 1);
      } else if (from > previewIndex && to <= previewIndex) {
        setPreviewIndex(previewIndex + 1);
      }
    }
  };

  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setPreviewIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, images.length]);

  const buildPdf = async () => {
    if (!images.length) return;
    setBusy(true);
    try {
      const pdf = new jsPDF({ orientation, unit: "pt", format: pageSize });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage(pageSize, orientation);
        const img = images[i];
        const dataUrl = await fileToDataUrl(img.file);
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        const format = img.file.type.includes("png") ? "PNG" : "JPEG";
        pdf.addImage(dataUrl, format, x, y, w, h, undefined, "FAST");
      }
      pdf.save(`crazytools-${Date.now()}.pdf`);
      toast.success("PDF exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const activePreviewImage =
    previewIndex !== null && images[previewIndex] ? images[previewIndex] : null;

  return (
    <div className="space-y-6">
      <DropZone onFiles={addFiles} label="Drop images or click to select" accept="image/*" />

      {images.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-hairline bg-surface/60 transition-all hover:border-primary/40"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  if (!Number.isNaN(from)) move(from, idx);
                }}
              >
                <div
                  className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black/40"
                  onClick={() => setPreviewIndex(idx)}
                  title="Click to view full preview"
                >
                  <img
                    src={img.url}
                    alt={img.file.name || `Page ${idx + 1}`}
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur-sm">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      Preview
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-hairline p-2 hairline-t">
                  <div className="mono flex items-center gap-2 text-[11px] text-muted-foreground">
                    <GripVertical className="h-3 w-3 cursor-grab" />
                    Page {idx + 1}
                  </div>
                  <button
                    onClick={() => remove(img.id)}
                    title="Remove page"
                    aria-label={`Remove page ${idx + 1}`}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-hairline bg-surface/40 p-4">
            <div className="flex gap-6">
              <SelectField
                label="Page size"
                value={pageSize}
                onChange={(v) => setPageSize(v as "a4" | "letter")}
                options={[
                  { v: "a4", l: "A4" },
                  { v: "letter", l: "Letter" },
                ]}
              />
              <SelectField
                label="Orientation"
                value={orientation}
                onChange={(v) => setOrientation(v as "portrait" | "landscape")}
                options={[
                  { v: "portrait", l: "Portrait" },
                  { v: "landscape", l: "Landscape" },
                ]}
              />
            </div>
            <button
              onClick={buildPdf}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              {busy ? "Building…" : "Export PDF"}
            </button>
          </div>
        </>
      )}

      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        {activePreviewImage && previewIndex !== null && (
          <DialogContent className="flex max-h-[92vh] w-[92vw] max-w-5xl flex-col border-hairline bg-background/95 p-4 backdrop-blur-md overflow-hidden">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-hairline pb-3 pr-6">
              <div className="flex items-center gap-3">
                <span className="mono rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Page {previewIndex + 1} of {images.length}
                </span>
                <DialogTitle className="max-w-[280px] truncate text-sm font-medium sm:max-w-sm">
                  {activePreviewImage.file.name}
                </DialogTitle>
                <span className="mono text-[11px] text-muted-foreground hidden sm:inline-block">
                  ({activePreviewImage.width} × {activePreviewImage.height}px)
                </span>
              </div>
            </DialogHeader>

            <DialogDescription className="sr-only">
              Full screen image preview for page {previewIndex + 1} of {images.length}.
            </DialogDescription>

            <div className="relative flex min-h-[300px] max-h-[72vh] flex-1 items-center justify-center rounded-md bg-black/60 py-2 overflow-hidden">
              <img
                src={activePreviewImage.url}
                alt={`Page ${previewIndex + 1}`}
                className="max-h-[70vh] max-w-full select-none rounded object-contain"
              />

              {previewIndex > 0 && (
                <button
                  onClick={() => setPreviewIndex(previewIndex - 1)}
                  title="Previous image (Left Arrow)"
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2.5 text-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground focus:outline-none"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {previewIndex < images.length - 1 && (
                <button
                  onClick={() => setPreviewIndex(previewIndex + 1)}
                  title="Next image (Right Arrow)"
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2.5 text-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground focus:outline-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-3 text-xs text-muted-foreground">
              <div className="mono flex items-center gap-2">
                <span>
                  Use <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">←</kbd>{" "}
                  <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">→</kbd> to navigate
                </span>
              </div>
              <button
                onClick={() => remove(activePreviewImage.id)}
                className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Page
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DropZone({
  onFiles,
  label,
  accept,
  multiple = true,
}: {
  onFiles: (files: FileList | File[]) => void;
  label: string;
  accept: string;
  multiple?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
        hover
          ? "border-primary bg-primary/5"
          : "border-hairline bg-surface/40 hover:border-primary/40"
      }`}
    >
      <Upload className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
      <span className="text-sm text-foreground">{label}</span>
      <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Runs locally · Files never leave your browser
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-hairline bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}
