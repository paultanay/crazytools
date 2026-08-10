import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://crazytools.js.org";

const CATEGORY_SLUGS = [
  "pdf",
  "image",
  "developer",
  "text",
  "converters",
  "generators",
  "security",
];

const TOOL_SLUGS = [
  "image-to-pdf",
  "pdf-compress",
  "pdf-merge",
  "image-compress",
  "json-formatter",
  "qr-generator",
  "base64",
  "markdown-to-pdf",
  "html-viewer",
  "regex-tester",
  "jwt-decoder",
  "password-generator",
  "color-converter",
  "unit-converter",
  "hash-generator",
  "uuid-generator",
  "csv-json",
  "diff-viewer",
  "case-converter",
  "latex-to-pdf",
  "ocr",
  "background-remover",
  "svg-optimizer",
  "css-specificity",
  "json-validator",
];

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/tools", changefreq: "weekly", priority: "0.9" },
          { path: "/auth", changefreq: "yearly", priority: "0.3" },
          ...CATEGORY_SLUGS.map((slug) => ({
            path: `/category/${slug}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          ...TOOL_SLUGS.map((slug) => ({
            path: `/tools/${slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
