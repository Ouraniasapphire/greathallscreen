import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.join(__dirname, "..", "public", "fonts");
const outputJson = path.join(__dirname, "..", "public", "fonts.json");
const outputCss = path.join(__dirname, "..", "public", "fonts.css");

try {
  // Ensure fonts directory exists
  await fs.access(fontsDir);

  // Read all font files
  const files = await fs.readdir(fontsDir);

  // Filter only .ttf and .otf
  const fonts = files.filter((file) => /\.(ttf|otf)$/i.test(file));

  // Strip extensions for font-family names
  const fontNames = fonts.map((file) => path.parse(file).name);

  // Save JSON list
  await fs.writeFile(outputJson, JSON.stringify(fonts, null, 2));

  // Build CSS
  const cssContent = fontNames
    .map(
      (name, i) => `
@font-face {
  font-family: "${name}";
  src: url("/fonts/${fonts[i]}") format("${
        fonts[i].toLowerCase().endsWith(".otf") ? "opentype" : "truetype"
      }");
  font-weight: normal;
  font-style: normal;
}
`
    )
    .join("\n");

  await fs.writeFile(outputCss, cssContent.trim() + "\n");

  console.log(
    `✅ fonts.json and fonts.css generated with ${fonts.length} fonts`
  );
} catch (err) {
  console.error("❌ Error generating font assets:", err.message);
  process.exit(1);
}
