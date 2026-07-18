import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const distRoot = join(process.cwd(), "dist");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".css": "text/css; charset=utf-8",
};

async function serveFile(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(distRoot, safePath);
  const body = await readFile(filePath);
  const contentType = mimeTypes[extname(filePath)] || "application/octet-stream";
  return new Response(body, { headers: { "content-type": contentType } });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    try {
      return await serveFile(url.pathname);
    } catch {
      return serveFile("/index.html");
    }
  },
};
