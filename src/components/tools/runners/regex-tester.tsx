import { useMemo, useState } from "react";

export function RegexTesterRunner() {
  const [pattern, setPattern] = useState("\\\\b\\\\w+@\\\\w+\\\\.[a-z]{2,}\\\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Contact us at hello@crazytools.dev or team@example.com.");

  const { error, matches } = useMemo(() => {
    try {
      // De-escape user's literal double-backslashes when typed
      const re = new RegExp(pattern, flags);
      const out: { match: string; index: number; groups: string[] }[] = [];
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(text))) {
          out.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(text);
        if (m) out.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      return { error: null as string | null, matches: out };
    } catch (e) {
      return { error: (e as Error).message, matches: [] };
    }
  }, [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (error || matches.length === 0) return text;
    const parts: (string | { m: string })[] = [];
    let last = 0;
    for (const m of matches) {
      parts.push(text.slice(last, m.index));
      parts.push({ m: m.match });
      last = m.index + m.match.length;
    }
    parts.push(text.slice(last));
    return parts;
  }, [matches, text, error]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="pattern"
          className="mono flex-1 rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="flags"
          className="mono w-24 rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="mono min-h-[160px] w-full resize-none rounded-lg border border-hairline bg-card p-3 text-[13px] outline-none focus:border-foreground/40"
      />
      {error ? (
        <p className="mono text-[12px] text-destructive">Invalid regex: {error}</p>
      ) : (
        <>
          <div className="rounded-lg border border-hairline bg-card p-4 text-[13px] leading-relaxed whitespace-pre-wrap">
            {typeof highlighted === "string"
              ? highlighted
              : highlighted.map((p, i) =>
                  typeof p === "string" ? (
                    <span key={i}>{p}</span>
                  ) : (
                    <mark key={i} className="rounded bg-yellow-200 px-0.5 text-black">{p.m}</mark>
                  ),
                )}
          </div>
          <p className="mono text-[12px] text-muted-foreground">{matches.length} match{matches.length === 1 ? "" : "es"}</p>
          {matches.length > 0 && (
            <ul className="mono space-y-1 text-[12px]">
              {matches.map((m, i) => (
                <li key={i} className="rounded border border-hairline bg-card px-3 py-2">
                  <span className="text-muted-foreground">[{m.index}]</span> {m.match}
                  {m.groups.length > 0 && (
                    <span className="ml-2 text-muted-foreground">groups: {JSON.stringify(m.groups)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
