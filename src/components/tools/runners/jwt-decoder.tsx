import { useMemo, useState } from "react";

function b64urlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

export function JwtDecoderRunner() {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTcwMDAwMDAwMH0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9FYR50DTn1YoU",
  );

  const parsed = useMemo(() => {
    const parts = token.split(".");
    if (parts.length !== 3) return { error: "JWT must have three parts (header.payload.signature)." };
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      return { header, payload, signature: parts[2], error: null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [token]);

  const format = (v: unknown) => JSON.stringify(v, null, 2);

  return (
    <div className="space-y-4">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value.trim())}
        spellCheck={false}
        placeholder="Paste JWT"
        className="mono min-h-[120px] w-full resize-none rounded-lg border border-hairline bg-card p-3 text-[12px] break-all outline-none focus:border-foreground/40"
      />
      {parsed.error ? (
        <p className="mono text-[12px] text-destructive">{parsed.error}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Header">{format(parsed.header)}</Panel>
          <Panel title="Payload">{format(parsed.payload)}</Panel>
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
      <pre className="mono overflow-auto rounded-lg border border-hairline bg-card p-4 text-[12px] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
