# Security

## Threat model

CrazyTools processes user files (PDFs, images, text). The security posture assumes:

- **Files are sensitive.** They must not leave the user's device unless the tool explicitly says so. Every v1 tool is local-only.
- **Anonymous access is safe.** No user data is written for anonymous visitors.
- **Signed-in users own their data.** Favorites and history are readable only by the user that created them, enforced at the database layer.

## Row-Level Security

Every user-owned table has RLS enabled and per-row policies scoped to `auth.uid()`. Structure of every user-data migration:

```sql
CREATE TABLE public.<name> (...);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<name> TO authenticated;
GRANT ALL ON public.<name> TO service_role;
ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows" ON public.<name>
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

RLS alone is not enough — PostgREST refuses requests without a matching `GRANT`. Both are required.

## Role checks

Roles are stored in a dedicated `user_roles` table (not on `profiles`) with a `SECURITY DEFINER` helper `public.has_role(_user_id, _role)`. Never check "am I an admin?" from `localStorage`, session storage, or a cookie — always go through `has_role` inside a server function.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY` — server-only, service-role. Bypasses RLS. Only used inside `*.server.ts` files or dynamically imported inside `.handler()` bodies.

- `VITE_*` variables are ship-to-client. Never rename a secret to `VITE_*` to "make it work" — it will leak into the client bundle.

## Auth flow

- Email + password via Supabase Auth.
- Google OAuth via Supabase Auth (`supabase.auth.signInWithOAuth`) with a same-origin `redirectTo`.
- Sessions are stored in `localStorage` by the Supabase browser client.
- The bearer token is attached to server-function calls by `attachSupabaseAuth` middleware in `src/start.ts`.
- On sign-out we cancel in-flight queries, clear the query cache, sign out of Supabase, then navigate to `/auth` with `replace: true`. Any deviation from this order leaves stale protected data reachable via the back button.

## Client-side hardening

- CSP is enforced by the platform. Inline scripts are only permitted for the SSR error overlay.
- `dangerouslySetInnerHTML` is used only in the Markdown → PDF preview, with `marked`'s sanitizer-safe defaults.
- Third-party dependencies are pinned with a lockfile.

## Reporting a vulnerability

Please open a private security advisory in the repository or email the maintainers. Do **not** file public issues for security concerns. We acknowledge reports within 3 business days and aim to ship a fix within 14.

## Denied patterns

The following have been rejected during development and must not be reintroduced:

- Storing roles on `profiles` — trivially exploitable via `UPDATE`.
- Using `supabaseAdmin` as the default Data API client — bypasses RLS and fails with `Expected 3 parts in JWT; got 1` on new-format keys.
- Anonymous sign-ups.
- Auto-confirming email addresses on sign-up.
- OAuth `redirect_uri` pointing at a protected route (`/dashboard`) — creates a race with session hydration and manifests as "clicking Sign in does nothing".
