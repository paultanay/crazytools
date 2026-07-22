import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  source: z.string().min(1).max(200_000),
  compiler: z.enum(["pdflatex", "xelatex", "lualatex"]).default("pdflatex"),
});

/**
 * Compile a LaTeX source to PDF using the public latex.ytotech.com service.
 * Runs in the edge/server runtime so the browser is not blocked by CORS.
 * Returns base64-encoded PDF bytes.
 */
export const compileLatex = createServerFn({ method: "POST" })
  .validator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const res = await fetch("https://latex.ytotech.com/builds/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: data.compiler,
        resources: [{ main: true, content: data.source }],
      }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const j = (await res.json()) as { logs?: string; message?: string };
        detail = j.logs || j.message || "";
      } catch {
        detail = await res.text();
      }
      return { ok: false as const, error: detail.slice(0, 20_000) || res.statusText };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    // Base64 encode
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    return { ok: true as const, pdfBase64: btoa(binary) };
  });
