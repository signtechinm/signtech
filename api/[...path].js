import { createApiApp, ensureSchema } from "../server/app.js";

const app = createApiApp();

export default async function handler(request, response) {
  await ensureSchema();
  return app(request, response);
}
