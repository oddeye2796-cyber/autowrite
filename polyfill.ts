// polyfill.ts
// Polyfill for pdf.js when bundled by esbuild/Vercel
if (typeof global !== "undefined") {
  if (!(global as any).DOMMatrix) (global as any).DOMMatrix = class DOMMatrix {};
  if (!(global as any).ImageData) (global as any).ImageData = class ImageData {};
  if (!(global as any).Path2D) (global as any).Path2D = class Path2D {};
}
