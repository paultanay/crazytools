<div align="center">

# CrazyTools

**The complete toolkit. In your browser.**

A professional platform of free, browser-native utilities for documents, images, developers, and text. Precision engineered. Zero installation. Zero limits.

[Architecture](./docs/ARCHITECTURE.md) · [API](./docs/API.md) · [Contributing](./docs/CONTRIBUTING.md)

</div>

---

## Overview

CrazyTools is an enterprise-grade, single-page web platform that ships a curated catalog of high-quality utilities. Every tool runs client-side by default — files never leave the user's machine unless the tool explicitly requires a server round-trip. Signed-in users get favorites, run history, and a personal dashboard, backed by a fully managed Postgres backend with row-level security.

### Highlights

- **8 flagship tools in v1** — Image→PDF, PDF Compress, PDF Merge, Image Compressor, JSON Formatter, QR Generator, Base64, Markdown→PDF.
- **Universal ⌘K command palette** — one shortcut, everything reachable.
- **Cinematic "Instrument" design system** — deep near-black canvas, electric-cyan accent, hairline dividers, precision typography.
- **SSR + edge runtime** — TanStack Start on Cloudflare Workers, sub-100ms cold starts.
- **Type-safe end to end** — TypeScript strict mode, generated route tree, generated database types.
- **Zero-trust data model** — every user-owned table is RLS-gated, every server function is bearer-authenticated.

---

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env

# 3. Run the dev server
pnpm run dev
```

The app is available at `http://localhost:8080`.

Full setup instructions, including backend provisioning: [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).

---

## Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **TanStack Start v1** | File-based routing, isomorphic loaders, `createServerFn` RPC |
| UI runtime | **React 19** | Automatic JSX transform, concurrent rendering |
| Build | **Vite 7** | Lightning CSS, SSR, edge-target output |
| Styling | **Tailwind CSS v4** | Native CSS `@theme`, no legacy config |
| Components | **shadcn/ui** (new-york) | Radix primitives, fully local |
| Motion | **Framer Motion** | Scroll-linked, cinematic transitions |
| Data | **TanStack Query v5** | Suspense reads, router-primed cache |
| Backend | **Supabase** (managed Postgres + Auth) | RLS, service-role isolation |
| Deployment | **Cloudflare Workers** | Edge SSR via Nitro |
| Language | **TypeScript** (strict) | `tsgo` for typecheck |
| Package manager | **pnpm** | Lockfile committed |

---

## Repository layout

```text
crazytools/
├── docs/                          # Long-form documentation (this folder is the source of truth)
│   ├── ARCHITECTURE.md            # System design, data flow, boundaries
│   ├── API.md                     # Server functions, REST surfaces, contracts
│   ├── DEVELOPMENT.md             # Local dev, tooling, workflows
│   ├── DEPLOYMENT.md              # Cloud/edge deployment, envs, rollout
│   ├── TOOLS.md                   # Tool catalog, how to add a new tool
│   ├── SECURITY.md                # Threat model, RLS policy, auth model
│   ├── CONTRIBUTING.md            # PR workflow, code style, commits
│   └── MCP.md                     # Model Context Protocol integrations
├── src/
│   ├── routes/                    # File-based routes (TanStack Router)
│   │   ├── __root.tsx             # Root layout, providers, head shell
│   │   ├── index.tsx              # Landing page
│   │   ├── tools.tsx              # /tools layout
│   │   ├── tools.index.tsx        # /tools list
│   │   ├── tools.$slug.tsx        # /tools/:slug detail runner
│   │   ├── category.$slug.tsx    # /category/:slug filtered index
│   │   ├── auth.tsx               # /auth sign-in / sign-up
│   │   ├── _authenticated/       # Auth-gated subtree (ssr:false)
│   │   │   ├── route.tsx          # Layout gate; redirects to /auth
│   │   │   └── dashboard.tsx      # User dashboard
│   │   └── api/                   # Server routes (raw HTTP endpoints)
│   ├── components/
│   │   ├── site/                  # Marketing shell (nav, footer, hero, palette)
│   │   ├── tools/                 # Tool-runner shell + individual runners
│   │   └── ui/                    # shadcn/ui primitives
│   ├── hooks/                     # Reusable client hooks
│   ├── integrations/
│   │   └── supabase/              # Backend clients (browser + server)
│   ├── lib/
│   │   ├── tools/                 # Tool catalog + shared tool logic
│   │   ├── user-data.functions.ts # Auth-gated server functions
│   │   └── utils.ts               # Small, pure utilities
│   ├── assets/                    # Static images imported via ES modules
│   ├── styles.css                 # Global tokens, Tailwind theme, base layer
│   ├── router.tsx                 # Router factory
│   ├── start.ts                   # Server start config + middleware
│   └── server.ts                  # SSR entry (error wrapper)
├── supabase/
│   ├── config.toml                # Managed by the platform — do not hand-edit
│   └── migrations/                # SQL migrations (numbered, immutable)
├── public/                        # Static assets served as-is
├── components.json                # shadcn/ui config
├── vite.config.ts                 # Build config
├── tsconfig.json                  # Strict TypeScript
└── package.json
```

---

## Scripts

| Script | Purpose |
|---|---|
| `pnpm run dev` | Start Vite dev server with HMR |
| `pnpm run build` | Production build (SSR bundle + client bundle) |
| `pnpm run preview` | Preview the production bundle locally |
| `pnpm run lint` | ESLint over `src/` |
| `pnpm run format` | Prettier write |

---

## Documentation index

| Document | What it covers |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | System boundaries, data flow, execution model, why decisions were made |
| [API reference](./docs/API.md) | Every server function and public route with input/output contracts |
| [Development setup](./docs/DEVELOPMENT.md) | Local environment, secrets, database migrations, debugging |
| [Deployment guide](./docs/DEPLOYMENT.md) | Edge build, environment variables, rollout, rollback |
| [Tools catalog](./docs/TOOLS.md) | Every shipped tool, its runtime, and how to add a new one |
| [Security model](./docs/SECURITY.md) | RLS, auth flow, secrets, threat model, disclosure |
| [Contributing](./docs/CONTRIBUTING.md) | Branching, commits, review, code style |
| [MCP integrations](./docs/MCP.md) | Model Context Protocol servers and how CrazyTools can be exposed as one |
| [Changelog](./CHANGELOG.md) | Versioned release notes |

---

## License

[MIT](./LICENSE) © CrazyTools contributors.
