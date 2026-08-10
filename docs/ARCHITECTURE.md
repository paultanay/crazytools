# Architecture

This document describes how CrazyTools is put together, why it's designed the way it is, and where each responsibility lives.

## Guiding principles

1. **Local-first by default.** Every tool should run in the browser. A tool only earns a server round-trip when there is a concrete reason (secrets, heavy WASM the client can't afford, external APIs).
2. **Type safety end-to-end.** Route params, search params, loader data, and database rows are inferred, not asserted.
3. **Explicit boundaries.** Client, server-function, and admin code live in filenames that make the boundary visible (`*.functions.ts`, `*.server.ts`).
4. **Zero-trust data.** Every user-owned row is behind Row-Level Security. `SECURITY DEFINER` helpers are limited to role checks.
5. **Progressive disclosure.** Public tools work signed-out. Sign-in unlocks personalization (favorites, history), never core functionality.

## High-level topology

```text
                     ┌──────────────────────────────────────────┐
                     │              User browser                │
                     │  ┌────────────────────────────────────┐  │
                     │  │ React 19 + TanStack Router client │  │
                     │  │ Tool runners (WASM / Canvas / JS) │  │
                     │  └───────────────┬────────────────────┘  │
                     └──────────────────┼───────────────────────┘
                                        │  fetch (RPC + HTML)
                                        ▼
                     ┌──────────────────────────────────────────┐
                     │           Vercel (SSR)                   │
                     │  TanStack Start · Vite bundle            │
                     │  ┌────────────────────────────────────┐  │
                     │  │ createServerFn handlers (RPC)     │  │
                     │  │ requireSupabaseAuth middleware    │  │
                     │  └───────────────┬────────────────────┘  │
                     └──────────────────┼───────────────────────┘
                                        │ Postgres wire · service role
                                        ▼
                     ┌──────────────────────────────────────────┐
                     │        Supabase (managed PG)             │
                     │  Auth · RLS · Migrations · Realtime      │
                     └──────────────────────────────────────────┘
```

## Execution model

TanStack Start code is **isomorphic by default**. The same route module runs during SSR on the Worker and during client navigation in the browser. Any code that needs a specific environment must declare that boundary explicitly:

| Boundary API         | Runs on     | Use for                                        |
| -------------------- | ----------- | ---------------------------------------------- |
| `createServerFn`     | Server only | RPC calls, DB reads/writes, secret-backed APIs |
| `createServerOnlyFn` | Server only | Server-only helpers not exposed as RPC         |
| `<ClientOnly>`       | Client only | Browser-only libraries, DOM APIs               |
| `useHydrated()`      | Both, gated | Render decisions that differ post-hydration    |

Rules we enforce:

- `process.env.*` is only read inside `.handler()` bodies. Reading it at module scope leaks secrets into client bundles or returns `undefined` on the Worker.
- Files matching `**/*.server.*` are hard-blocked from client bundles by the bundler. Admin/service-role code lives there.
- Server functions used by client-reachable routes live in `*.functions.ts`. Any admin import inside those files uses `await import("@/integrations/supabase/client.server")` inside the handler body.

## Routing

File-based routing under `src/routes/`. The Vite plugin auto-generates `src/routeTree.gen.ts` — never hand-edit it.

| Path              | Route file                                    | Auth       |
| ----------------- | --------------------------------------------- | ---------- |
| `/`               | `routes/index.tsx`                            | Public     |
| `/tools`          | `routes/tools.tsx` + `routes/tools.index.tsx` | Public     |
| `/tools/:slug`    | `routes/tools.$slug.tsx`                      | Public     |
| `/category/:slug` | `routes/category.$slug.tsx`                   | Public     |
| `/auth`           | `routes/auth.tsx`                             | Public     |
| `/dashboard`      | `routes/_authenticated/dashboard.tsx`         | Auth-gated |

The `_authenticated/route.tsx` pathless layout gates its entire subtree:

- `ssr: false` — Supabase stores the session in `localStorage`, which the SSR runtime can't read. Server-gating causes redirect loops on hard refresh.
- `beforeLoad` calls `supabase.auth.getUser()` and throws `redirect({ to: "/auth" })` when no user is present.
- Protected server functions inside the subtree get the bearer token attached automatically by `functionMiddleware` in `src/start.ts`.

## Data flow

The canonical read shape is **loader-primed TanStack Query + `useSuspenseQuery`** in the component:

```tsx
const historyOptions = queryOptions({
  queryKey: ["history"],
  queryFn: () => listHistory(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(historyOptions),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useSuspenseQuery(historyOptions);
  // ...
}
```

Why: the loader primes the cache on the server during SSR, the component reads the same query key on the client, and there is no flash-of-loading-state.

## Auth model

Two audiences:

- **Anonymous visitors** — full access to every tool, every category, every search. No client-side gating for tool usage.
- **Signed-in users** — favorites, run history, dashboard.

Sign-in path:

1. `/auth` renders email/password + Google.
2. Google flows through `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`.
3. On successful sign-in the client stores the session in `localStorage` (Supabase browser client) and the root `onAuthStateChange` listener invalidates the router.
4. Protected server functions carry the bearer token via `attachSupabaseAuth` middleware.
5. Sign-out cancels in-flight queries, clears the cache, calls `supabase.auth.signOut()`, then navigates to `/auth` with `replace: true`.

Detailed threat model: [`SECURITY.md`](./SECURITY.md).

## Design system

The "Instrument" direction, encoded as CSS variables in `src/styles.css`:

- Canvas: `oklch(0.14 0.015 260)` (deep near-black).
- Accent: `oklch(0.82 0.14 215)` (electric cyan).
- Type: Inter Variable body, JetBrains Mono for chrome and code.
- Dividers: 1px hairlines at `oklch(0.28 0.02 260 / 0.6)`.
- Motion: Framer Motion, cinematic easing `[0.16, 1, 0.3, 1]`, scroll-linked reveals.

Never hardcode `text-white` or `bg-black` — everything routes through semantic tokens so the theme is a one-file change.

## Backend schema

Three tables, all in the `public` schema:

- `profiles` — 1:1 with `auth.users`, populated by the `handle_new_user` trigger.
- `favorites` — `(user_id, tool_slug)` composite, RLS scoped to `auth.uid()`.
- `tool_history` — `(user_id, tool_slug, ran_at)`, capped client-side to the last 100 rows per user.

Every table has `GRANT` statements immediately after `CREATE TABLE`, RLS enabled, and per-audience policies. See [`docs/API.md`](./API.md) for the full DDL.

## Observability

- Client errors surface via the error boundary in `src/lib/error-page.ts`.
- Server errors are caught in the `errorMiddleware` in `src/start.ts` and rendered as HTML.
- Runtime errors are captured via the error boundary and logged to the console.

## Non-goals for v1

- No in-browser IDE or code execution sandbox.
- No user-submitted tools / marketplace.
- No team workspaces or shared sessions.
