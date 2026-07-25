import type { LucideIcon } from "lucide-react";
import {
  FileImage,
  FileText,
  Files,
  Image as ImageIcon,
  Braces,
  QrCode,
  Binary,
  FileCode,
  KeyRound,
  Lock,
  Palette,
  Regex,
  Ruler,
  Hash,
  Table,
  Code2,
  ScanLine,
  Eraser,
  Fingerprint,
  Diff,
  Type,
  Globe,
  Cog,
} from "lucide-react";

export type CategorySlug =
  | "pdf"
  | "image"
  | "developer"
  | "text"
  | "converters"
  | "generators"
  | "security";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { slug: "pdf", name: "PDF", tagline: "Assemble, compress, and transform documents.", description: "A precise toolkit for working with PDF documents entirely in the browser." },
  { slug: "image", name: "Image", tagline: "Compress, convert, and prepare visual assets.", description: "High-fidelity image utilities that run locally with modern browser codecs." },
  { slug: "developer", name: "Developer", tagline: "Format, validate, inspect, and run code.", description: "Utilities for engineers: formatters, decoders, generators, compilers, and inspectors." },
  { slug: "text", name: "Text", tagline: "Convert, format, and manipulate written content.", description: "Precision tools for text and markup workflows: case conversion, diffing, Markdown-to-PDF export, and clean copy transforms — all in your browser." },
  { slug: "converters", name: "Converters", tagline: "Move between formats without losing intent.", description: "Format conversion utilities across images, documents, and data." },
  { slug: "generators", name: "Generators", tagline: "Produce assets on demand.", description: "Deterministic and configurable generators for common workflows." },
  { slug: "security", name: "Security", tagline: "Encode, hash, and inspect.", description: "Cryptographic and encoding primitives, executed locally." },
];

export interface Tool {
  slug: string;
  name: string;
  short: string;
  description: string;
  categories: CategorySlug[];
  icon: LucideIcon;
  keywords: string[];
  available: boolean;
  featured?: boolean;
}

export const TOOLS: Tool[] = [
  { slug: "image-to-pdf", name: "Image to PDF", short: "Combine images into a single PDF.", description: "Assemble one or more images into a paginated PDF. Everything is processed in your browser.", categories: ["pdf", "converters", "image"], icon: FileImage, keywords: ["jpg", "png", "convert"], available: true, featured: true },
  { slug: "pdf-compress", name: "PDF Compress", short: "Reduce PDF file size.", description: "Compress a PDF locally by re-encoding embedded images.", categories: ["pdf"], icon: Files, keywords: ["reduce", "shrink", "optimize"], available: true, featured: true },
  { slug: "pdf-merge", name: "PDF Merge", short: "Combine multiple PDFs.", description: "Merge several PDF documents into one. Reorder before export.", categories: ["pdf"], icon: FileText, keywords: ["combine", "join"], available: true, featured: true },
  { slug: "image-compress", name: "Image Compressor", short: "Reduce image size, preserve quality.", description: "Compress JPEG, PNG, and WebP images with a quality control.", categories: ["image", "converters"], icon: ImageIcon, keywords: ["optimize", "jpeg", "png", "webp"], available: true, featured: true },
  { slug: "json-formatter", name: "JSON Formatter", short: "Format, validate, and minify JSON.", description: "Paste JSON, receive an instantly formatted tree with precise error diagnostics.", categories: ["developer"], icon: Braces, keywords: ["pretty", "validate", "minify"], available: true, featured: true },
  { slug: "qr-generator", name: "QR Code Generator", short: "Generate customizable QR codes.", description: "Produce high-density QR codes from text, URLs, or contact data with adjustable size and error-correction levels. Export as PNG.", categories: ["generators", "developer"], icon: QrCode, keywords: ["url", "link"], available: true, featured: true },
  { slug: "base64", name: "Base64 Encoder", short: "Encode and decode Base64.", description: "Convert text or files to Base64 and back. Handles UTF-8 and binary data.", categories: ["developer", "text", "security"], icon: Binary, keywords: ["encode", "decode"], available: true, featured: true },
  { slug: "markdown-to-pdf", name: "Markdown to PDF", short: "Render Markdown to a PDF.", description: "Live-preview Markdown and export a paginated PDF. Supports code blocks, tables, and inline formatting.", categories: ["text", "converters", "pdf"], icon: FileCode, keywords: ["md", "export"], available: true, featured: true },

  { slug: "html-viewer", name: "HTML Viewer", short: "Preview HTML in a sandboxed iframe.", description: "Render HTML, CSS, and JavaScript in a secure sandboxed preview.", categories: ["developer", "text"], icon: Globe, keywords: ["preview", "render", "sandbox"], available: true },
  { slug: "regex-tester", name: "Regex Tester", short: "Test regular expressions live.", description: "Test regular expressions with match highlighting and group inspection.", categories: ["developer", "text"], icon: Regex, keywords: ["pattern", "match"], available: true },
  { slug: "jwt-decoder", name: "JWT Decoder", short: "Inspect JSON Web Tokens.", description: "Decode header and payload of any JWT and inspect its structural integrity.", categories: ["developer", "security"], icon: KeyRound, keywords: ["auth", "token"], available: true },
  { slug: "password-generator", name: "Password Generator", short: "Cryptographically strong passwords.", description: "Configure length, character classes, and entropy. Powered by the Web Crypto API.", categories: ["security", "generators"], icon: Lock, keywords: ["random", "secure"], available: true },
  { slug: "color-converter", name: "Color Converter", short: "Convert between color spaces.", description: "HEX, RGB, HSL — round-trip conversion with visual preview.", categories: ["developer", "generators"], icon: Palette, keywords: ["hex", "rgb", "hsl"], available: true },
  { slug: "unit-converter", name: "Unit Converter", short: "Precision conversions across units.", description: "Length, weight, temperature, and data units in one interface.", categories: ["converters"], icon: Ruler, keywords: ["metric", "imperial"], available: true },
  { slug: "hash-generator", name: "Hash Generator", short: "SHA-1, SHA-256, SHA-384, SHA-512.", description: "Compute cryptographic hashes for text using the Web Crypto API.", categories: ["security", "developer"], icon: Hash, keywords: ["checksum", "digest"], available: true },
  { slug: "uuid-generator", name: "UUID Generator", short: "Generate UUIDs at scale.", description: "Version 4 UUIDs with bulk output for seeding fixtures and identifiers.", categories: ["developer", "generators"], icon: Fingerprint, keywords: ["guid", "id"], available: true },
  { slug: "csv-json", name: "CSV ⇄ JSON", short: "Convert between CSV and JSON.", description: "Bidirectional conversion between CSV and JSON with automatic header detection, delimiter handling, and pretty-printed output. Runs locally in the browser.", categories: ["developer", "converters"], icon: Table, keywords: ["spreadsheet", "data"], available: true },
  { slug: "diff-viewer", name: "Diff Viewer", short: "Compare two text documents.", description: "Line-level diff with additions, deletions, and unchanged context.", categories: ["developer", "text"], icon: Diff, keywords: ["compare"], available: true },
  { slug: "case-converter", name: "Case Converter", short: "Transform text between cases.", description: "camelCase, snake_case, kebab-case, PascalCase, TITLE CASE, and more.", categories: ["text", "developer"], icon: Type, keywords: ["camel", "snake"], available: true },

  { slug: "latex-to-pdf", name: "LaTeX to PDF", short: "Compile LaTeX documents to PDF.", description: "Compile LaTeX with pdflatex, xelatex, or lualatex and download the rendered PDF. Backed by a hosted TeX engine.", categories: ["converters", "pdf", "developer"], icon: FileCode, keywords: ["tex", "compile", "pdflatex", "xelatex"], available: true },
  { slug: "ocr", name: "Image OCR", short: "Extract text from images.", description: "Detect and export text from screenshots and photos with Tesseract, entirely in your browser.", categories: ["image", "text", "converters"], icon: ScanLine, keywords: ["recognize", "extract", "tesseract"], available: true },
  { slug: "background-remover", name: "Background Remover", short: "Remove image backgrounds with AI.", description: "Remove backgrounds from portraits, products, and graphics with a neural network that runs entirely in your browser. No uploads, no servers.", categories: ["image"], icon: Eraser, keywords: ["remove", "transparent", "erase", "subject"], available: true },
  { slug: "svg-optimizer", name: "SVG Optimizer", short: "Minify and optimize SVG files.", description: "Reduce SVG size while preserving fidelity, powered by SVGO in the browser.", categories: ["image", "developer"], icon: Code2, keywords: ["minify", "vector", "svgo"], available: true },
  { slug: "css-specificity", name: "CSS Specificity Calculator", short: "Calculate CSS selector specificity.", description: "Paste CSS selectors and compute their specificity as (ID, Class, Element) — handles :is(), :not(), :where(), attributes, and pseudo-elements.", categories: ["developer"], icon: Cog, keywords: ["css", "selector", "specificity", "cascade"], available: true },
  { slug: "json-validator", name: "JSON Validator & Viewer", short: "Validate JSON and inspect it in a tree view.", description: "Validate JSON syntax with precise error diagnostics and explore the parsed structure in a collapsible tree viewer. Runs entirely in your browser.", categories: ["developer"], icon: Braces, keywords: ["json", "validate", "viewer", "tree", "lint"], available: true },
];


export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function toolsInCategory(slug: CategorySlug): Tool[] {
  return TOOLS.filter((t) => t.categories.includes(slug));
}
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((t) => {
    const hay = [t.name, t.short, t.description, ...t.keywords, ...t.categories].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export const FEATURED_TOOLS = TOOLS.filter((t) => t.featured);
export const AVAILABLE_TOOLS = TOOLS.filter((t) => t.available);
export const TOTAL_TOOLS = TOOLS.length;
export const RoadmapIcon = Cog;

/** Look up a tool's icon by slug. Falls back to Cog. */
export function getToolIcon(slug: string): LucideIcon {
  const tool = TOOLS.find((t) => t.slug === slug);
  return tool?.icon ?? Cog;
}

/** Tool minus the non-serializable icon reference — safe for SSR payloads. */
export type ToolData = Omit<Tool, "icon">;
