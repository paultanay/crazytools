# Remove Lovable Dependencies & Clean Up AI References

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all Lovable platform dependencies, AI-generated wording, and bun-specific config from the codebase. Keep Supabase auth working directly without the Lovable broker. Make the project work with npm/pnpm.

**Architecture:** The project uses TanStack Start + React + Supabase. Lovable was used as the hosting platform with a custom Vite config wrapper, OAuth broker, and error reporting. We remove the Lovable-specific packages/files and replace them with standard open-source equivalents.

**Tech Stack:** TanStack Start, React 19, Vite, Tailwind CSS v4, Supabase, TypeScript

---

### Task 1: Delete Lovable-specific files

**Files:**
- Delete: `.lovable/` (directory)
- Delete: `src/integrations/lovable/` (directory)
- Delete: `src/lib/lovable-error-reporting.ts`
- Delete: `bun.lock`
- Delete: `bunfig.toml`

- [ ] **Step 1: Remove all Lovable-specific files**

```bash
Remove-Item -Recurse -Force ".lovable"
Remove-Item -Recurse -Force "src/integrations/lovable"
Remove-Item -Force "src/lib/lovable-error-reporting.ts"
Remove-Item -Force "bun.lock"
Remove-Item -Force "bunfig.toml"
```

---

### Task 2: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove Lovable dependencies from package.json**

Remove lines:
- `"@lovable.dev/cloud-auth-js": "^1.1.2"` from dependencies
- `"@lovable.dev/vite-tanstack-config": "2.7.1"` from devDependencies

---

### Task 3: Rewrite vite.config.ts

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Replace Lovable vite config with standard plugins**

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    tsConfigPaths(),
  ],
});
```

---

### Task 4: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Remove the Lovable notice block (lines 1-10)**

Replace entire file content with an empty file or remove the Lovable HTML comment block.

---

### Task 5: Update src/routes/__root.tsx

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Remove `reportLovableError` import and usage**

Remove line: `import { reportLovableError } from "../lib/lovable-error-reporting";`
Remove lines 53-55 in ErrorComponent (the `useEffect` calling `reportLovableError`).
Update JSON-LD URLs from `https://crazy-tools.lovable.app` to generic placeholders.

---

### Task 6: Update src/routes/auth.tsx

**Files:**
- Modify: `src/routes/auth.tsx`

- [ ] **Step 1: Replace Lovable OAuth with direct Supabase Google OAuth**

Remove: `import { lovable } from "@/integrations/lovable";`
Replace `lovable.auth.signInWithOAuth("google", ...)` with `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`

---

### Task 7: Update src/routes/sitemap[.]xml.ts

**Files:**
- Modify: `src/routes/sitemap[.]xml.ts`

- [ ] **Step 1: Update BASE_URL**

Change `const BASE_URL = "https://crazy-tools.lovable.app"` to a generic base URL.

---

### Task 8: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Remove LOVABLE_API_KEY comment**

Remove the line: `# LOVABLE_API_KEY is provisioned by the platform. Do not set it manually.`

---

### Task 9: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Remove Lovable references and update bun→npm/pnpm**

Replace:
- `bun install` → `npm install` (or `pnpm install`)
- `bun run dev` → `npm run dev`
- Lovable Cloud reference in tech stack → Supabase directly
- `crazy-tools.lovable.app` URL → project's own URL
- `src/integrations/lovable/` mention in repo layout → remove

---

### Task 10: Update CHANGELOG.md

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Remove Lovable mention**

Line 33: Change "(via the Lovable broker)" to "(via Supabase Auth)"

---

### Task 11: Update docs files

**Files:**
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/DEPLOYMENT.md`
- Modify: `docs/SECURITY.md`
- Modify: `docs/MCP.md`
- Modify: `docs/DEVELOPMENT.md`

- [ ] **Step 1: Remove Lovable references from all docs files**

Replace:
- `crazy-tools.lovable.app` → project domain
- Lovable Cloud → Supabase
- Lovable platform references → generic self-hosted guidance
- `lovable.auth.signInWithOAuth` → direct Supabase auth
- bun → npm/pnpm
- Remove LOVABLE_API_KEY references
