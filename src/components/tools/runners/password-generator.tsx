import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";

export function PasswordGeneratorRunner() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [pw, setPw] = useState("");

  const alphabet = useMemo(() => {
    return `${lower ? LOWER : ""}${upper ? UPPER : ""}${nums ? NUMBERS : ""}${syms ? SYMBOLS : ""}`;
  }, [lower, upper, nums, syms]);

  const generate = () => {
    if (!alphabet) return toast.error("Pick at least one character class");
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let out = "";
    for (let i = 0; i < length; i++) out += alphabet[arr[i] % alphabet.length];
    setPw(out);
  };

  const copy = () => {
    if (!pw) return;
    navigator.clipboard.writeText(pw);
    toast.success("Copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-hairline bg-card p-4">
        <code className="mono flex-1 break-all text-[15px]">{pw || "Press Generate"}</code>
        <button onClick={copy} className="rounded-md border border-hairline p-2 hover:bg-accent" aria-label="copy">
          <Copy className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>
      <div className="space-y-3">
        <label className="mono flex items-center justify-between text-[12px]">
          Length: {length}
          <input
            type="range"
            min={6}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="ml-4 flex-1"
          />
        </label>
        <Toggle label="Lowercase (a-z)" checked={lower} onChange={setLower} />
        <Toggle label="Uppercase (A-Z)" checked={upper} onChange={setUpper} />
        <Toggle label="Numbers (0-9)" checked={nums} onChange={setNums} />
        <Toggle label="Symbols" checked={syms} onChange={setSyms} />
      </div>
      <button
        onClick={generate}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Generate
      </button>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-hairline bg-card px-4 py-2 text-sm">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
