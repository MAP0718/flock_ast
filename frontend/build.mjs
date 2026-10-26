import { copyFile } from "node:fs/promises";
import { build } from "esbuild";

const apiUrl = process.env.API_URL?.trim();

if (!apiUrl) {
  throw new Error("Set API_URL in frontend/.env before building");
}

try {
  new URL(apiUrl);
} catch {
  throw new Error("API_URL in frontend/.env must be a valid absolute URL");
}

await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  jsx: "automatic",
  outdir: "dist",
  entryNames: "app",
  define: {
    __API_URL__: JSON.stringify(apiUrl),
  },
});

await copyFile("index.html", "dist/index.html");
