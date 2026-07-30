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
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">This surface failed to render</h1>
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CrazyTools — Free browser-based tools" },
      {
        name: "description",
        content:
          "Free browser-based tools: PDF, image, code, and text. Nothing leaves your machine.",
      },
      { name: "author", content: "CrazyTools" },
      { property: "og:title", content: "CrazyTools" },
      {
        property: "og:description",
        content: "Free browser-based tools. Nothing leaves your machine.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "CrazyTools" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CrazyTools" },
      {
        name: "twitter:description",
        content: "The complete toolkit. In your browser.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
              "@id": "https://crazytools.app/#organization",
              name: "CrazyTools",
              url: "https://crazytools.app/",
            },
            {
              "@type": "WebSite",
              "@id": "https://crazytools.app/#website",
              url: "https://crazytools.app/",
              name: "CrazyTools",
              description:
                "Free browser-based tools: PDF, image, code, and text.",
              publisher: { "@id": "https://crazytools.app/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://crazytools.app/tools?q={search_term_string}",
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
    <html lang="en">
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
