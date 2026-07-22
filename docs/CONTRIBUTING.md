# Contributing

Thanks for your interest in improving CrazyTools. This document describes how to propose changes and what the review process looks like.

## Ground rules

1. **Discussion first for anything ambiguous.** Open an issue before writing code for a new tool, a design change, or a schema change.
2. **Small, focused PRs.** One tool per PR, one refactor per PR. Don't mix.
3. **Follow the design system.** No hardcoded colors, no cheap gradients, no emoji in UI copy.
4. **Type safety is non-negotiable.** No `any`, no `@ts-ignore`. Use `unknown` and narrow.
5. **Local-first tools stay local-first.** A tool that could run in the browser must run in the browser.

## Workflow

```bash
# 1. Sync
git switch main && git pull

# 2. Branch (naming: feat/, fix/, chore/, docs/)
git switch -c feat/regex-tester

# 3. Work
pnpm run dev

# 4. Verify
pnpm run typecheck
pnpm run lint
pnpm run build

# 5. Open a PR against main
```

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(tools): add regex tester
fix(auth): clear query cache before signOut
docs(api): document toggleFavorite input schema
chore(deps): bump framer-motion to 12.42
```

Types we use: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`.

## Code style

- Prettier is authoritative. Run `pnpm run format` before committing.
- ESLint config: [`eslint.config.js`](../eslint.config.js).
- Prefer named exports for non-component modules.
- Import order: node built-ins → external → `@/` internal → relative.
- Keep files under ~300 lines; extract when they grow.

## Adding a tool

See [`TOOLS.md`](./TOOLS.md#adding-a-new-tool). Every new tool PR must include:

- Catalog entry.
- Runner component.
- Runner registration.
- A screenshot in the PR description (mobile + desktop).
- Manual test notes.

## Adding a route

- Create the file in `src/routes/` using the flat dot-separated convention (`settings.profile.tsx`, not `settings/profile.tsx`).
- Set real `head()` metadata — title < 60 chars, description < 160 chars, matching `og:title` and `og:description`. Never reuse the home page's tags.
- If the route needs a loader, define `errorComponent` and `notFoundComponent`.
- If the route is auth-gated, place it under `src/routes/_authenticated/`.

## Database changes

- One migration per logical change.
- Numbered filename: `YYYYMMDDHHMMSS_<slug>.sql`.
- Never edit a merged migration; write a follow-up.
- Every `CREATE TABLE public.<name>` is immediately followed by `GRANT`s, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, and `CREATE POLICY`. See [`SECURITY.md`](./SECURITY.md#row-level-security).

## Review checklist

Reviewers verify:

- [ ] Design tokens used (no `text-white`, no `#hex` in JSX).
- [ ] Type check passes, no `any` introduced.
- [ ] New env vars are documented in `.env.example` and [`DEVELOPMENT.md`](./DEVELOPMENT.md).
- [ ] New server functions are documented in [`API.md`](./API.md).
- [ ] New tools are listed in [`TOOLS.md`](./TOOLS.md).
- [ ] No secrets, tokens, or user PII in commits.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
