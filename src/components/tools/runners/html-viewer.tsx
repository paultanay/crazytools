import { useState } from "react";

const SAMPLE = `<!doctype html>
<html>
  <head>
    <title>Preview</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; background: #fafafa; color: #111; }
      h1 { color: #0a5cff; }
      button { padding: 8px 14px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>Hello, world.</h1>
    <p>Edit the HTML on the left and see it render live.</p>
    <button onclick="alert('It works!')">Click me</button>
  </body>
</html>`;

export function HtmlViewerRunner() {
  const [html, setHtml] = useState(SAMPLE);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        spellCheck={false}
        className="mono min-h-[520px] w-full resize-none rounded-lg border border-hairline bg-card p-4 text-[13px] leading-relaxed outline-none focus:border-foreground/40"
      />
      <iframe
        title="html-preview"
        sandbox="allow-scripts allow-forms allow-modals"
        srcDoc={html}
        className="min-h-[520px] w-full rounded-lg border border-hairline bg-white"
      />
    </div>
  );
}
