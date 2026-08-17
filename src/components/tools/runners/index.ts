import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const runner = <T extends ComponentType>(load: () => Promise<{ default: T }>) => lazy(load);

export const RUNNERS: Record<string, LazyExoticComponent<ComponentType>> = {
  "image-to-pdf": runner(() =>
    import("./image-to-pdf").then((m) => ({ default: m.ImageToPdfRunner })),
  ),
  "pdf-compress": runner(() =>
    import("./pdf-compress").then((m) => ({ default: m.PdfCompressRunner })),
  ),
  "pdf-merge": runner(() => import("./pdf-merge").then((m) => ({ default: m.PdfMergeRunner }))),
  "image-compress": runner(() =>
    import("./image-compress").then((m) => ({ default: m.ImageCompressRunner })),
  ),
  "json-formatter": runner(() =>
    import("./json-formatter").then((m) => ({ default: m.JsonFormatterRunner })),
  ),
  "qr-generator": runner(() =>
    import("./qr-generator").then((m) => ({ default: m.QrGeneratorRunner })),
  ),
  base64: runner(() => import("./base64").then((m) => ({ default: m.Base64Runner }))),
  "markdown-to-pdf": runner(() =>
    import("./markdown-to-pdf").then((m) => ({ default: m.MarkdownToPdfRunner })),
  ),
  "html-viewer": runner(() =>
    import("./html-viewer").then((m) => ({ default: m.HtmlViewerRunner })),
  ),
  "regex-tester": runner(() =>
    import("./regex-tester").then((m) => ({ default: m.RegexTesterRunner })),
  ),
  "jwt-decoder": runner(() =>
    import("./jwt-decoder").then((m) => ({ default: m.JwtDecoderRunner })),
  ),
  "password-generator": runner(() =>
    import("./password-generator").then((m) => ({ default: m.PasswordGeneratorRunner })),
  ),
  "hash-generator": runner(() =>
    import("./hash-generator").then((m) => ({ default: m.HashGeneratorRunner })),
  ),
  "uuid-generator": runner(() =>
    import("./uuid-generator").then((m) => ({ default: m.UuidGeneratorRunner })),
  ),
  "color-converter": runner(() =>
    import("./color-converter").then((m) => ({ default: m.ColorConverterRunner })),
  ),
  "unit-converter": runner(() =>
    import("./unit-converter").then((m) => ({ default: m.UnitConverterRunner })),
  ),
  "csv-json": runner(() => import("./csv-json").then((m) => ({ default: m.CsvJsonRunner }))),
  "diff-viewer": runner(() =>
    import("./diff-viewer").then((m) => ({ default: m.DiffViewerRunner })),
  ),
  "case-converter": runner(() =>
    import("./case-converter").then((m) => ({ default: m.CaseConverterRunner })),
  ),
  "latex-to-pdf": runner(() =>
    import("./latex-to-pdf").then((m) => ({ default: m.LatexToPdfRunner })),
  ),
  ocr: runner(() => import("./ocr").then((m) => ({ default: m.OcrRunner }))),
  "background-remover": runner(() =>
    import("./background-remover").then((m) => ({ default: m.BackgroundRemoverRunner })),
  ),
  "svg-optimizer": runner(() =>
    import("./svg-optimizer").then((m) => ({ default: m.SvgOptimizerRunner })),
  ),
  "css-specificity": runner(() =>
    import("./css-specificity").then((m) => ({ default: m.CssSpecificityRunner })),
  ),
  "json-validator": runner(() =>
    import("./json-validator").then((m) => ({ default: m.JsonValidatorRunner })),
  ),
};
