import { useCallback, useState } from "react";
import { Upload, Download, X, GripVertical } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

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

  const remove = (id: string) =>
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });

  const move = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  };

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

  return (
    <div className="space-y-6">
      <DropZone onFiles={addFiles} label="Drop images or click to select" accept="image/*" />

      {images.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-hairline bg-surface/60"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  if (!Number.isNaN(from)) move(from, idx);
                }}
              >
                <img
                  src={img.url}
                  alt=""
                  className="aspect-video w-full object-contain bg-black/40"
                />
                <div className="flex items-center justify-between border-hairline p-2 hairline-t">
                  <div className="mono flex items-center gap-2 text-[11px] text-muted-foreground">
                    <GripVertical className="h-3 w-3 cursor-grab" />
                    Page {idx + 1}
                  </div>
                  <button
                    onClick={() => remove(img.id)}
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
