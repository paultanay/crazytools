import { useState } from "react";
import { Copy, Check, ArrowRightLeft, Upload } from "lucide-react";
import { toast } from "sonner";

export function Base64Runner() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState("The complete toolkit. In your browser.");
  const [copied, setCopied] = useState(false);

  const output = (() => {
    try {
      if (!text) return "";
      if (mode === "encode") {
        return btoa(unescape(encodeURIComponent(text)));
      }
      return decodeURIComponent(escape(atob(text.trim())));
    } catch {
      return "Invalid input for selected mode.";
    }
  })();

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const encodeFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    setMode("encode");
    setText(`data:${file.type || "application/octet-stream"};base64,${b64}`);
    toast.success("File encoded to Base64 data URL");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="mono inline-flex rounded-md border border-hairline p-0.5 text-[11px] uppercase tracking-widest">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1.5 transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setText(output);
            setMode(mode === "encode" ? "decode" : "encode");
          }}
          className="mono inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowRightLeft className="h-3 w-3" />
          Swap
        </button>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) encodeFile(f);
          }}
          className="mono inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <Upload className="h-3 w-3" />
          Encode file
          <input
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && encodeFile(e.target.files[0])}
          />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Input"
          className="mono min-h-[360px] w-full resize-none rounded-lg border border-hairline bg-surface/40 p-4 text-[13px] leading-relaxed outline-none focus:border-primary/50"
        />
        <div className="relative min-h-[360px] overflow-auto rounded-lg border border-hairline bg-surface/40 p-4">
          <button
            onClick={copy}
            className="absolute right-3 top-3 rounded-md border border-hairline bg-background/60 p-1.5 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <pre className="mono whitespace-pre-wrap break-all text-[13px] leading-relaxed">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}
