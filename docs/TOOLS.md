# Tools catalog

Every tool in CrazyTools is a self-contained React component under `src/components/tools/runners/`. The catalog metadata lives in `src/lib/tools/catalog.ts` and is the single source of truth for the tool list, categories, and search.

## Shipped tools (v1)

| Slug | Name | Category | Runtime | Notes |
|---|---|---|---|---|
| `image-to-pdf` | Image → PDF | PDF | Client (jsPDF) | Multi-image, drag-and-drop reorder |
| `pdf-compress` | PDF Compress | PDF | Client (pdf-lib) | Object-stream compression, preserves text layer |
| `pdf-merge` | PDF Merge | PDF | Client (pdf-lib) | Merge N PDFs, order preserving |
| `image-compress` | Image Compressor | Image | Client (browser-image-compression) | Lossy WebP/JPEG with target size |
| `json-formatter` | JSON Formatter / Validator | Developer | Client (native) | Pretty-print, minify, JSONPath (roadmap) |
| `qr-generator` | QR Code Generator | Generators | Client (qrcode) | SVG + PNG export, ECC selectable |
| `base64` | Base64 Encode / Decode | Text | Client (native) | UTF-8 safe, drag-and-drop file mode |
| `markdown-to-pdf` | Markdown → PDF | Converters | Client (marked + jsPDF) | GFM, inline CSS, single-file export |

## Roadmap

| Slug | Name | Blocker |
|---|---|---|
| `latex-to-pdf` | LaTeX → PDF | Heavy WASM (~30 MB), needs progressive fetch |
| `web-ide` | Browser IDE | Monaco + language servers; separate app shell |
| `svg-optimizer` | SVG Optimizer | Waiting on `svgo` ES2022 build |
| `regex-tester` | Regex Tester | Ready — write runner |
| `color-picker` | Color Picker + Palette | Ready — write runner |

Roadmap entries are surfaced in the UI as disabled cards labeled "Coming soon" so users aren't surprised.

---

## Adding a new tool

Every tool must satisfy:

1. **Runs in the browser** unless there is a documented reason not to.
2. **No sign-in required** for core functionality.
3. **No files leave the device** unless the tool description states otherwise.
4. **Motion respects `prefers-reduced-motion`**.
5. **Keyboard reachable** — every interactive control has a focus state.

### Step 1 — register in the catalog

Edit `src/lib/tools/catalog.ts`:

```ts
{
  slug: "regex-tester",
  name: "Regex Tester",
  category: "developer",
  description: "Live-test regular expressions with capture groups and flag toggles.",
  keywords: ["regex", "pattern", "match", "grep"],
  status: "live", // "live" | "roadmap"
}
```

The `slug` must match `/^[a-z0-9-]+$/` and be unique.

### Step 2 — create the runner

`src/components/tools/runners/regex-tester.tsx`:

```tsx
export function RegexTesterRunner() {
  // Your tool UI. Use `<ToolShell>` primitives where relevant.
  return <div>…</div>;
}
```

Guidelines:

- Import from `@/components/ui/*` for buttons, inputs, dialogs.
- Use `toast` from `sonner` for user-visible errors.
- Keep the component under 250 lines; pull heavy logic into `src/lib/tools/<slug>.ts` when it grows.
- Never touch `window` at module scope — put browser reads inside `useEffect` or event handlers.

### Step 3 — register the runner

Edit `src/components/tools/runners/index.ts`:

```ts
import { RegexTesterRunner } from "./regex-tester";

export const RUNNERS: Record<string, ComponentType> = {
  // ...
  "regex-tester": RegexTesterRunner,
};
```

### Step 4 — verify

```bash
pnpm run typecheck
pnpm run dev
# Open http://localhost:8080/tools/regex-tester
```

Check:

- [ ] Tool loads without console errors.
- [ ] Head metadata (title, description) reads correctly.
- [ ] Runner works in mobile viewport (`preview_ui` at 390×844).
- [ ] Tool appears in `/tools`, in its category page, and in `⌘K` search.
- [ ] Favorite button toggles when signed in.

### Step 5 — record it in the docs

Add a row to the "Shipped tools" table above with the runtime and any caveats.

---

## Categories

Categories are declared in `src/lib/tools/catalog.ts` alongside the tools. Current set:

- `pdf` — Documents
- `image` — Image processing
- `developer` — Code, data, and dev-adjacent utilities
- `text` — Text transforms
- `converters` — Format conversion
- `generators` — Generate structured artifacts (QR, hashes, IDs, …)
- `security` — Hashing, encoding, key generation

Adding a category is a one-line change in the same file. Keep the total below ~10 to preserve the category rail's visual rhythm.
