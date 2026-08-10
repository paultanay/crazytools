# Changelog

All notable changes to CrazyTools are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- LaTeX → PDF (progressive WASM fetch)
- Browser IDE (Monaco + language servers)
- MCP server at `/api/public/mcp`
- Playwright smoke tests for critical paths
- Regex Tester, Color Picker + Palette, SVG Optimizer

---

## [1.0.0] — 2026-07-06

Initial public release.

### Added

- Landing page with cinematic aurora hero, animated typewriter search, category rail, featured bento grid, stat band, and CTA.
- Universal `⌘K` command palette.
- Routes: `/`, `/tools`, `/tools/:slug`, `/category/:slug`, `/auth`, `/dashboard`.
- 8 flagship tools:
  - Image → PDF
  - PDF Compress
  - PDF Merge
  - Image Compressor
  - JSON Formatter / Validator
  - QR Code Generator
  - Base64 Encode / Decode
  - Markdown → PDF
- Auth with email + password and Google (via Supabase Auth).
- User-scoped favorites and run history, backed by RLS-gated tables.
- Signed-in dashboard listing favorites and recent runs.
- Enterprise-grade documentation set under `docs/`.

### Infrastructure

- TanStack Start v1 on Cloudflare Workers.
- Tailwind CSS v4 with the "Instrument" design token set.
- TanStack Query v5 for loader-primed data reads.
- Framer Motion for cinematic transitions.
- Bun as the package manager with a 24-hour minimum-release-age supply-chain guard.

### Security

- All user-owned tables (`profiles`, `favorites`, `tool_history`) have explicit `GRANT`s and per-row RLS scoped to `auth.uid()`.
- Bearer token attached to server-function calls via `attachSupabaseAuth` middleware.
- Service-role key isolated to `*.server.ts` modules.
