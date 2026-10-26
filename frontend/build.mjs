import { copyFile } from "node:fs/promises";
import { build } from "esbuild";

const apiUrl = process.env.API_URL?.trim() || "";

if (apiUrl) {
  try {
    new URL(apiUrl);
  } catch {
    throw new Error("API_URL in frontend/.env must be a valid absolute URL");
  }
}

await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  jsx: "automatic",
  outdir: "dist",
  entryNames: "app",
  define: {
    __API_URL__: JSON.stringify(apiUrl),
    __API_PORT__: JSON.stringify(process.env.API_PORT || "3000"),
  },
});

await copyFile("index.html", "dist/index.html");
