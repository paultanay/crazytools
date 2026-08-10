import { useMemo, useState } from "react";

interface Specificity {
  ids: number;
  classes: number;
  elements: number;
}

function calcSpecificity(selector: string): Specificity {
  let s = selector.trim();

  // Strip strings and comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/"[^"]*"|'[^']*'/g, '""');

  // Strip :not(...), :is(...), :where(...) — compute inner separately
  // Simplify: remove :where() (zero specificity)
  s = s.replace(/:where\([^)]*\)/g, "");

  let ids = 0;
  let classes = 0;
  let elements = 0;

  // IDs: #foo
  const idMatches = s.match(/#[\w-]+/g);
  if (idMatches) ids += idMatches.length;
  s = s.replace(/#[\w-]+/g, " ");

  // Attributes: [foo="bar"]  → counts as class
  const attrMatches = s.match(/\[[^\]]+\]/g);
  if (attrMatches) classes += attrMatches.length;
  s = s.replace(/\[[^\]]+\]/g, " ");

  // Pseudo-classes: :hover, :nth-child(...), :is(...), :not(...)
  const pseudoClassRe = /:(?!:)([\w-]+)(\([^)]*\))?/g;
  let match: RegExpExecArray | null;
  while ((match = pseudoClassRe.exec(s)) !== null) {
    const name = match[1].toLowerCase();
    if (name === "is" || name === "not" || name === "has") {
      // Take the highest specificity of the arguments
      const inner = match[2] ? match[2].slice(1, -1) : "";
      if (inner) {
        const parts = inner.split(",").map((p) => calcSpecificity(p));
        const highest = parts.reduce(
          (a, b) => {
            const av = a.ids * 10000 + a.classes * 100 + a.elements;
            const bv = b.ids * 10000 + b.classes * 100 + b.elements;
            return bv > av ? b : a;
          },
          { ids: 0, classes: 0, elements: 0 },
        );
        ids += highest.ids;
        classes += highest.classes;
        elements += highest.elements;
      }
    } else {
      classes += 1;
    }
  }
  s = s.replace(pseudoClassRe, " ");

  // Pseudo-elements: ::before → counts as element
  const pseudoElRe = /::[\w-]+/g;
  const pseudoElMatches = s.match(pseudoElRe);
  if (pseudoElMatches) elements += pseudoElMatches.length;
  s = s.replace(pseudoElRe, " ");

  // Classes: .foo
  const classMatches = s.match(/\.[\w-]+/g);
  if (classMatches) classes += classMatches.length;
  s = s.replace(/\.[\w-]+/g, " ");

  // Elements: tags (letters that remain, ignoring combinators and *)
  const elementMatches = s.match(/[a-zA-Z][\w-]*/g);
  if (elementMatches) elements += elementMatches.length;

  return { ids, classes, elements };
}

export function CssSpecificityRunner() {
  const [selectors, setSelectors] = useState(
    "#header .nav a:hover\n.card > .title\nul li a\n.btn.btn-primary\n*",
  );

  const results = useMemo(() => {
    return selectors
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((selector) => {
        try {
          const spec = calcSpecificity(selector);
          return {
            selector,
            spec,
            score: `${spec.ids},${spec.classes},${spec.elements}`,
            weight: spec.ids * 100 + spec.classes * 10 + spec.elements,
            error: null as string | null,
          };
        } catch (e) {
          return {
            selector,
            spec: { ids: 0, classes: 0, elements: 0 },
            score: "—",
            weight: 0,
            error: (e as Error).message,
          };
        }
      });
  }, [selectors]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-[12px] font-medium tracking-tight text-muted-foreground">
          Selectors (one per line)
        </label>
        <textarea
          value={selectors}
          onChange={(e) => setSelectors(e.target.value)}
          spellCheck={false}
          className="mono h-80 w-full resize-none rounded-lg border border-hairline bg-card p-3 text-[13px] outline-none focus:border-foreground/40"
        />
      </div>
      <div>
        <label className="mb-2 block text-[12px] font-medium tracking-tight text-muted-foreground">
          Specificity (ID, Class, Element)
        </label>
        <div className="rounded-lg border border-hairline bg-card">
          <div className="grid grid-cols-[1fr,auto,auto] gap-3 border-b border-hairline px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Selector</span>
            <span>Score</span>
            <span>Weight</span>
          </div>
          <div className="max-h-72 overflow-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr,auto,auto] items-center gap-3 border-b border-hairline px-3 py-2 last:border-b-0 text-[13px]"
              >
                <span className="mono truncate">{r.selector}</span>
                <span className="mono tabular-nums">{r.score}</span>
                <span className="mono tabular-nums text-muted-foreground">{r.weight}</span>
              </div>
            ))}
            {results.length === 0 && (
              <div className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                Enter selectors to calculate specificity.
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          Specificity is expressed as three counters: IDs, classes/attributes/pseudo-classes, and
          elements/pseudo-elements. Higher IDs beat any number of classes; higher classes beat any
          number of elements.
        </p>
      </div>
    </div>
  );
}
