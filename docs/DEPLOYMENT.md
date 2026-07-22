# Deployment

CrazyTools targets **Cloudflare Workers** via TanStack Start's Nitro build.

## Environments

| Environment | URL | Purpose |
|---|---|---|
| Production | Configured domain | Published deployments |
| Custom domain | User-configured | Optional |

Preview and production URLs are **stable** — they don't change if the project is renamed. Use them in external services (webhooks, cron, uptime probes).

## Build pipeline

```text
pnpm run build
  ├─ TanStack Router plugin regenerates src/routeTree.gen.ts
  ├─ Vite builds the client bundle (browser)
  ├─ Vite builds the SSR bundle (Worker)
  └─ Nitro packages the Worker with static assets
```

Output is placed under `.output/`.

## Environment variables

Set via the platform's Backend UI (never commit secrets):

| Variable | Where |
|---|---|
| `VITE_SUPABASE_URL` | Configured in deployment environment |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Configured in deployment environment |
| `VITE_SUPABASE_PROJECT_ID` | Configured in deployment environment |
| `SUPABASE_URL` | Configured in deployment environment |
| `SUPABASE_PUBLISHABLE_KEY` | Configured in deployment environment |
| `SUPABASE_SERVICE_ROLE_KEY` | Configured, **server-only** |

## Rollout

Deploy via Cloudflare Workers (or your chosen adapter). Every deploy replaces the entire production Worker.

## Custom domain

1. Configure your domain's DNS with your provider.
2. Point it at your Cloudflare Workers deployment.
3. TLS certificates are issued automatically.

## Health checks

- The root path (`/`) returns 200 during SSR when the Worker is healthy.
- Static assets are cached at Cloudflare's edge; a hard 404 from the origin usually means the deploy is incomplete.

## Cold-start budget

- **Target:** < 100 ms edge cold start (Nitro + Workers is well under this in practice).
- **Watchdog:** don't add Node-only packages (see the runtime restrictions in [`ARCHITECTURE.md`](./ARCHITECTURE.md)). `sharp`, `puppeteer`, `child_process`, and native addons will not run on the Worker.

## Database migrations in production

Migrations are applied automatically when new numbered files land in `supabase/migrations/`. A migration is considered immutable once it's been applied — never edit it. Roll forward with a new migration to correct a mistake.

## Monitoring & logs

- **Client errors:** logged to browser console.
- **Server-function logs:** available in the Cloudflare dashboard.
- **Edge request logs:** available in the Cloudflare dashboard for advanced debugging.

## Backup & restore

- **Database:** Supabase runs continuous backups. Point-in-time restore is available for the last 7 days.
- **Static assets:** committed in `src/assets/` and rebuilt from source on every deploy.
- **Migrations:** committed in Git and reproducible from a clean database.
