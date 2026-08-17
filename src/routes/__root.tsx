import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

const themeInitScript = `
(function(){try{
  var t = localStorage.getItem('crazytools-theme');
  if(!t){t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';}
  if(t === 'dark') document.documentElement.classList.add('dark');
}catch(e){}
})();
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Error 404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
          Route not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you requested is not part of the current build.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="mono text-xs uppercase tracking-[0.3em] text-destructive">Runtime error</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          This surface failed to render
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A local exception was caught. Retry the request or return to the home surface.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://crazytools.eu.cc";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CrazyTools — Free Browser-Based Tools" },
      {
        name: "description",
        content:
          "CrazyTools: 25+ free online tools — PDF, image, code & text utilities. 100% browser-based. Nothing leaves your machine. No sign-up required.",
      },
      { name: "author", content: "CrazyTools" },
      {
        name: "robots",
        content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      },
      { name: "theme-color", content: "#09090b" },
      {
        name: "keywords",
        content:
          "free online tools, pdf tools, image compressor, json formatter, qr code generator, base64 encoder, browser tools, no upload",
      },
      { property: "og:title", content: "CrazyTools — Free Browser-Based Tools" },
      {
        property: "og:description",
        content:
          "25+ free browser-based tools: PDF, image, code & text. Nothing leaves your machine.",
      },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CrazyTools — Free Browser-Based Tools" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "CrazyTools" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CrazyTools — Free Browser-Based Tools" },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:image:alt", content: "CrazyTools — Free Browser-Based Tools" },
      {
        name: "twitter:description",
        content:
          "25+ free browser-based tools. PDF, image, code, text. Nothing leaves your machine.",
      },
      ...(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION
        ? [
            {
              name: "google-site-verification",
              content: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION,
            },
          ]
        : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "canonical", href: SITE_URL },
    ],
    scripts: [
      { children: themeInitScript },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "CrazyTools",
              url: `${SITE_URL}/`,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/favicon.ico`,
              },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: `${SITE_URL}/`,
              name: "CrazyTools",
              description:
                "Free browser-based tools: PDF, image, code, and text. Nothing leaves your machine.",
              publisher: { "@id": `${SITE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/tools?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
