import { useMemo, useState } from "react";

// Simple LCS-based line diff
function diffLines(a: string[], b: string[]) {
  const n = a.length,
    m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: { kind: "eq" | "del" | "add"; text: string }[] = [];
  let i = 0,
    j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ kind: "eq", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: "del", text: a[i] });
      i++;
    } else {
      out.push({ kind: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ kind: "del", text: a[i++] });
  while (j < m) out.push({ kind: "add", text: b[j++] });
  return out;
}

export function DiffViewerRunner() {
  const [left, setLeft] = useState("The quick brown fox\njumps over the lazy dog");
  const [right, setRight] = useState("The quick red fox\njumps over the lazy cat");

  const rows = useMemo(() => diffLines(left.split("\n"), right.split("\n")), [left, right]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          spellCheck={false}
          className="mono min-h-[240px] resize-none rounded-lg border border-hairline bg-card p-3 text-[13px] outline-none focus:border-foreground/40"
        />
        <textarea
          value={right}
          onChange={(e) => setRight(e.target.value)}
          spellCheck={false}
          className="mono min-h-[240px] resize-none rounded-lg border border-hairline bg-card p-3 text-[13px] outline-none focus:border-foreground/40"
        />
      </div>
      <div className="mono overflow-auto rounded-lg border border-hairline bg-card p-3 text-[12.5px]">
        {rows.map((r, i) => (
          <div
            key={i}
            className={
              r.kind === "add"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : r.kind === "del"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  : ""
            }
          >
            <span className="mr-2 text-muted-foreground">
              {r.kind === "add" ? "+" : r.kind === "del" ? "-" : " "}
            </span>
            {r.text || " "}
          </div>
        ))}
      </div>
    </div>
  );
}
