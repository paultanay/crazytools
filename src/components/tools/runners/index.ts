import type { ComponentType } from "react";
import { ImageToPdfRunner } from "./image-to-pdf";
import { PdfCompressRunner } from "./pdf-compress";
import { PdfMergeRunner } from "./pdf-merge";
import { ImageCompressRunner } from "./image-compress";
import { JsonFormatterRunner } from "./json-formatter";
import { QrGeneratorRunner } from "./qr-generator";
import { Base64Runner } from "./base64";
import { MarkdownToPdfRunner } from "./markdown-to-pdf";
import { HtmlViewerRunner } from "./html-viewer";
import { RegexTesterRunner } from "./regex-tester";
import { JwtDecoderRunner } from "./jwt-decoder";
import { PasswordGeneratorRunner } from "./password-generator";
import { HashGeneratorRunner } from "./hash-generator";
import { UuidGeneratorRunner } from "./uuid-generator";
import { ColorConverterRunner } from "./color-converter";
import { UnitConverterRunner } from "./unit-converter";
import { CsvJsonRunner } from "./csv-json";
import { DiffViewerRunner } from "./diff-viewer";
import { CaseConverterRunner } from "./case-converter";
import { LatexToPdfRunner } from "./latex-to-pdf";
import { OcrRunner } from "./ocr";
import { BackgroundRemoverRunner } from "./background-remover";
import { SvgOptimizerRunner } from "./svg-optimizer";
import { CssSpecificityRunner } from "./css-specificity";
import { JsonValidatorRunner } from "./json-validator";


export const RUNNERS: Record<string, ComponentType> = {
  "image-to-pdf": ImageToPdfRunner,
  "pdf-compress": PdfCompressRunner,
  "pdf-merge": PdfMergeRunner,
  "image-compress": ImageCompressRunner,
  "json-formatter": JsonFormatterRunner,
  "qr-generator": QrGeneratorRunner,
  "base64": Base64Runner,
  "markdown-to-pdf": MarkdownToPdfRunner,
  "html-viewer": HtmlViewerRunner,
  "regex-tester": RegexTesterRunner,
  "jwt-decoder": JwtDecoderRunner,
  "password-generator": PasswordGeneratorRunner,
  "hash-generator": HashGeneratorRunner,
  "uuid-generator": UuidGeneratorRunner,
  "color-converter": ColorConverterRunner,
  "unit-converter": UnitConverterRunner,
  "csv-json": CsvJsonRunner,
  "diff-viewer": DiffViewerRunner,
  "case-converter": CaseConverterRunner,
  "latex-to-pdf": LatexToPdfRunner,
  "ocr": OcrRunner,
  "background-remover": BackgroundRemoverRunner,
  "svg-optimizer": SvgOptimizerRunner,
  "css-specificity": CssSpecificityRunner,
  "json-validator": JsonValidatorRunner,
};

