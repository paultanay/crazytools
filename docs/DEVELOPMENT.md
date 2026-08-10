# Development

Everything you need to run CrazyTools locally, contribute changes, and debug them safely.

## Prerequisites

| Tool | Version | Why |
|---|---|---|---|
| [pnpm](https://pnpm.io) | ≥ 9 | Package manager |
| Node.js | ≥ 20 | Runtime |
| Git | any | Version control |

Optional but recommended: VS Code with the ESLint, Prettier, and Tailwind CSS IntelliSense extensions.

## First-time setup

```bash
git clone <repo>
cd crazytools
pnpm install
cp .env.example .env
pnpm run dev
```

The dev server binds to `http://localhost:8080` with HMR.

## Environment variables

All variables are typed and validated at build time. See [`.env.example`](../.env.example) for the current source of truth.

| Variable                        | Scope        | Required | Notes                                               |
| ------------------------------- | ------------ | -------- | --------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Client + SSR | ✅       | Public Data API URL                                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client + SSR | ✅       | Publishable key (safe to ship to the browser)       |
| `VITE_SUPABASE_PROJECT_ID`      | Client       | ✅       | Project reference                                   |
| `SUPABASE_URL`                  | Server only  | ✅       | Same as `VITE_SUPABASE_URL`, injected on the Worker |
| `SUPABASE_PUBLISHABLE_KEY`      | Server only  | ✅       | Same as its `VITE_` twin                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only  | ✅       | **Never expose to the client**                      |

Read env inside `.handler()` bodies, never at module scope. See [`ARCHITECTURE.md`](./ARCHITECTURE.md#execution-model).

## Scripts

```bash
pnpm run dev        # Vite dev server with HMR
pnpm run build      # Production build (SSR + client)
pnpm run preview    # Serve the production bundle locally
pnpm run lint       # ESLint
pnpm run format     # Prettier write
```

## Project layout

See the [README](../README.md#repository-layout) for the full tree. The short version:

- `src/routes/` — pages and API routes (file-based, don't edit `routeTree.gen.ts`).
- `src/components/site/` — marketing shell.
- `src/components/tools/` — tool shell + per-tool runners.
- `src/lib/tools/catalog.ts` — the single source of truth for the tool list.
- `src/integrations/supabase/` — Supabase clients (browser + server).
- `supabase/migrations/` — numbered SQL migrations, immutable once merged.

## Adding a new tool

Full walkthrough: [`TOOLS.md`](./TOOLS.md#adding-a-new-tool). Summary:

1. Add an entry to `src/lib/tools/catalog.ts` with a unique `slug`, `name`, `category`, and short `description`.
2. Create a runner at `src/components/tools/runners/<slug>.tsx` that exports a default component.
3. Register it in `src/components/tools/runners/index.ts`.
4. Run `pnpm run typecheck` and manually verify at `/tools/<slug>`.

## Database migrations

Migrations are numbered SQL files under `supabase/migrations/`. They are **immutable once merged** — never edit a committed migration; write a new one.

Every migration that creates a table in the `public` schema **must**:

1. `CREATE TABLE ...`
2. `GRANT` statements to the roles allowed by RLS
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
4. `CREATE POLICY ...`

Skipping step 2 causes 100% of Data API requests to fail with a permission error — RLS is not enough. Details: [`SECURITY.md`](./SECURITY.md#row-level-security).

## Debugging

| Symptom                                           | Where to look                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Blank screen, `500 for /src/styles.css`           | Missing font/CSS package. `pnpm install`, restart dev server.                                                                        |
| `Cannot find module '@/…'`                        | The file doesn't exist — create it before importing.                                                                                 |
| `React is not defined` at runtime                 | Add `import * as React from "react"` — automatic JSX transform doesn't include the namespace.                                        |
| `Expected 3 parts in JWT; got 1`                  | You're using `supabaseAdmin` for a Data API read. Switch to a publishable-key client or `requireSupabaseAuth`.                       |
| Sign-out then back-button restores protected data | You skipped `queryClient.clear()`. See auth-guards knowledge.                                                                        |
| Build fails with `Unauthorized` during prerender  | A public route's loader is calling a `requireSupabaseAuth` server fn. Move the call into a component or a `_authenticated/*` loader. |

## Editor conventions

- Prettier is the formatter of record. See [`.prettierrc`](../.prettierrc).
- ESLint config lives in [`eslint.config.js`](../eslint.config.js).
- Import ordering: node built-ins → external → internal (`@/*`) → relative.
- No default exports for non-component modules.

## Testing (roadmap)

v1 ships without automated tests to keep the surface small. The testing plan:

- Playwright for critical user paths (`/`, `/tools/pdf-compress`, sign-in).
- Vitest for pure utilities in `src/lib/`.
- Contract tests for server functions using `msw` at the RPC boundary.

Track: [`CHANGELOG.md`](../CHANGELOG.md).
