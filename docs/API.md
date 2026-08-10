# API reference

CrazyTools exposes two kinds of server surfaces:

1. **Server functions** (`createServerFn`) — typed RPC used by the app itself. Not intended for external callers.
2. **Server routes** (`/api/public/*`) — raw HTTP endpoints intended for webhooks or external systems. None ship in v1.

Every server function returns plain JSON-serializable data. Errors thrown from `.handler()` propagate to the client as regular exceptions.

---

## Server functions

All authenticated functions use the `requireSupabaseAuth` middleware. The bearer token is attached automatically by client-side `functionMiddleware` — callers never construct headers by hand.

### `listFavorites`

Return every tool the caller has favorited.

- **Method:** `POST` (RPC)
- **Auth:** required
- **Location:** `src/lib/user-data.functions.ts`

**Input:** none.

**Output:**

```ts
Array<{
  tool_slug: string;
  created_at: string; // ISO 8601
}>;
```

**Errors:**

- `Unauthorized` (401) — no valid session.

---

### `toggleFavorite`

Add or remove the caller's favorite for a given tool.

- **Method:** `POST`
- **Auth:** required

**Input:**

```ts
{
  tool_slug: string;
} // validated with Zod; must match /^[a-z0-9-]+$/
```

**Output:**

```ts
{
  favorited: boolean;
} // final state after toggle
```

**Errors:**

- `Unauthorized` (401)
- `Invalid input` — schema violation.

---

### `listHistory`

Return the caller's most recent tool runs, newest first, capped at 100.

- **Method:** `POST`
- **Auth:** required

**Input:** none.

**Output:**

```ts
Array<{
  tool_slug: string;
  ran_at: string; // ISO 8601
}>;
```

---

### `recordRun`

Record that the caller ran a tool. Client-side callers debounce to at most one call per tool per 5 seconds.

- **Method:** `POST`
- **Auth:** required

**Input:**

```ts
{
  tool_slug: string;
}
```

**Output:**

```ts
{
  ok: true;
}
```

The server also enforces the 100-row-per-user cap by deleting the oldest overflow rows in the same transaction.

---

## Calling server functions from a component

```tsx
import { useServerFn } from "@tanstack/react-start";
import { toggleFavorite } from "@/lib/user-data.functions";

function FavoriteButton({ slug }: { slug: string }) {
  const toggle = useServerFn(toggleFavorite);
  return <button onClick={() => toggle({ data: { tool_slug: slug } })}>Favorite</button>;
}
```

Never `fetch()` the internal `/_serverFn/*` URL directly — the payload format is TanStack's private RPC protocol, not plain JSON.

---

## Server routes (`/api/public/*`)

Reserved for webhooks and external API endpoints. **None are exposed in v1.**

When adding one:

1. Create the file under `src/routes/api/public/<name>.ts`.
2. Verify the caller (HMAC signature, shared secret, or IP allowlist) **before** doing any work.
3. Validate the body with Zod.
4. Never return PII.
5. Document the endpoint here.

Example scaffold:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/example-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("x-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha256", process.env.WEBHOOK_SECRET!)
          .update(body)
          .digest("hex");
        if (
          signature.length !== expected.length ||
          !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
        ) {
          return new Response("invalid signature", { status: 401 });
        }
        // ... handle verified payload ...
        return new Response("ok");
      },
    },
  },
});
```

---

## Database schema (public)

### `profiles`

| Column         | Type          | Notes                                        |
| -------------- | ------------- | -------------------------------------------- |
| `id`           | `uuid` PK     | FK → `auth.users.id`, cascade delete         |
| `display_name` | `text`        | Derived from OAuth `name` / email local part |
| `avatar_url`   | `text`        | Optional                                     |
| `created_at`   | `timestamptz` | `default now()`                              |

Row is created by the `handle_new_user` trigger when a new `auth.users` row appears.

### `favorites`

| Column       | Type          | Notes                                |
| ------------ | ------------- | ------------------------------------ |
| `user_id`    | `uuid`        | FK → `auth.users.id`, cascade delete |
| `tool_slug`  | `text`        | Matches a slug in the catalog        |
| `created_at` | `timestamptz` | `default now()`                      |

Primary key: `(user_id, tool_slug)`. RLS: user can select/insert/delete own rows.

### `tool_history`

| Column      | Type          | Notes                                |
| ----------- | ------------- | ------------------------------------ |
| `id`        | `uuid` PK     | `default gen_random_uuid()`          |
| `user_id`   | `uuid`        | FK → `auth.users.id`, cascade delete |
| `tool_slug` | `text`        |                                      |
| `ran_at`    | `timestamptz` | `default now()`                      |

Index: `(user_id, ran_at desc)`. RLS: user can select/insert own rows.
