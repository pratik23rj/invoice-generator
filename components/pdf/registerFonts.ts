import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Register Inter with @react-pdf/renderer.
 * Safe to call multiple times; only runs once.
 */
export function registerPdfFonts() {
  if (registered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: "/fonts/Inter-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Inter-Medium.ttf", fontWeight: 500 },
      { src: "/fonts/Inter-Bold.ttf", fontWeight: "bold" },
    ],
  });
  registered = true;
}
