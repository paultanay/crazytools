import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const text = [
          "User-agent: *",
          "Allow: /",
          "",
          "Sitemap: https://crazytools.app/sitemap.xml",
        ].join("\n");

        return new Response(text, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
