import { createReadStream } from "node:fs";
import { createServer } from "node:http";

const files = {
  "/": ["index.html", "text/html"],
  "/index.html": ["index.html", "text/html"],
  "/app.js": ["app.js", "text/javascript"],
  "/app.css": ["app.css", "text/css"],
};

createServer((req, res) => {
  const file = files[req.url.split("?")[0]];

  if (!file) {
    res.writeHead(404).end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": `${file[1]}; charset=utf-8` });
  createReadStream(new URL(`./dist/${file[0]}`, import.meta.url)).pipe(res);
}).listen(process.env.PORT || 5173, () => {
  console.log(`Frontend listening on port ${process.env.PORT || 5173}`);
});
