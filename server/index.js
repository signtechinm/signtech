import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { createApiApp, ensureSchema } from "./app.js";

const app = createApiApp();
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || process.env.APP_PORT || 5173;
const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

async function mountClient() {
  if (isProduction) {
    app.use(express.static(distDir));
    app.get(/.*/, (_request, response) => {
      response.sendFile(path.join(distDir, "index.html"));
    });
    return;
  }

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

async function startServer() {
  await ensureSchema();
  await mountClient();

  app.listen(port, "127.0.0.1", () => {
    console.log(`Signtech app listening on http://127.0.0.1:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start Signtech app:", error);
  process.exit(1);
});
