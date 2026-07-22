import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { openCommandPalette } from "./command-palette";

const PROMPTS = [
  "Compress a PDF",
  "Merge PDFs",
  "Convert images to PDF",
  "Format JSON",
  "Generate a QR code",
  "Run Python code",
  "Encode Base64",
  "Test a regex",
  "Compile C++",
  "Decode a JWT",
];

export function AnimatedSearchHero() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const target = PROMPTS[index];
    let i = 0;
    let mounted = true;
    setTyped("");
    const type = () => {
      if (!mounted) return;
      if (i <= target.length) {
        setTyped(target.slice(0, i));
        i++;
        setTimeout(type, 55);
      } else {
        setTimeout(() => {
          if (mounted) setIndex((v) => (v + 1) % PROMPTS.length);
        }, 1800);
      }
    };
    type();
    return () => {
      mounted = false;
    };
  }, [index]);

  return (
    <button
      onClick={openCommandPalette}
      aria-label="Search tools — open command palette"
      className="group mx-auto flex w-full max-w-xl items-center gap-3 rounded-xl border border-hairline bg-card px-5 py-4 text-left transition-colors hover:border-foreground/40"
    >
      <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      <div className="flex-1 text-[15px]">
        <span>{typed}</span>
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-foreground" />
      </div>
      <kbd className="mono hidden rounded border border-hairline bg-background px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
