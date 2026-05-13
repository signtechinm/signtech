import "dotenv/config";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { defaultContent } from "./default-content.js";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const sessions = new Map();
const sessionTtlMs = 1000 * 60 * 60 * 8;
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const rootDir = process.cwd();
const uploadDir = path.join(rootDir, "public", "uploads");
const imageExtensions = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

let schemaReady;

export function ensureSchema() {
  schemaReady ||= ensureSchemaOnce();
  return schemaReady;
}

async function ensureSchemaOnce() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (const [key, value] of Object.entries(defaultContent)) {
    await pool.query(
      `INSERT INTO site_content (key, value)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)]
    );
  }

  await ensureAdminUser();
}

async function ensureAdminUser() {
  const { hash, salt } = await hashPassword(adminPassword);
  await pool.query(
    `INSERT INTO admin_users (username, password_hash, salt, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   salt = EXCLUDED.salt,
                   updated_at = NOW()`,
    [adminUsername, hash, salt]
  );
}

async function readAllContent() {
  const result = await pool.query("SELECT key, value FROM site_content ORDER BY key ASC");
  return result.rows.reduce((content, row) => {
    content[row.key] = row.value;
    return content;
  }, {});
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ hash: derivedKey.toString("hex"), salt });
    });
  });
}

function createToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    user: { id: user.id, username: user.username, role: user.role },
    expiresAt: Date.now() + sessionTtlMs,
  });
  return token;
}

function getSession(request) {
  const auth = request.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function requireAuth(request, response, next) {
  const session = getSession(request);
  if (!session) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }
  request.adminUser = session.user;
  request.adminToken = session.token;
  next();
}

export function createApiApp() {
  const app = express();

  if (process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
  }

  app.use(express.json({ limit: "1mb" }));
  app.use("/uploads", express.static(uploadDir));

  app.get("/api/health", async (_request, response) => {
    try {
      await pool.query("SELECT 1");
      response.json({ ok: true });
    } catch (error) {
      response.status(500).json({ ok: false, error: error.message });
    }
  });

  app.get("/api/content", async (_request, response) => {
    try {
      response.json(await readAllContent());
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (request, response) => {
    const { username, password } = request.body || {};
    if (!username || !password) {
      response.status(400).json({ error: "Username and password are required." });
      return;
    }

    const result = await pool.query(
      "SELECT id, username, password_hash, salt, role FROM admin_users WHERE username = $1",
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      response.status(401).json({ error: "Invalid username or password." });
      return;
    }

    const { hash } = await hashPassword(password, user.salt);
    const expected = Buffer.from(user.password_hash, "hex");
    const actual = Buffer.from(hash, "hex");
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      response.status(401).json({ error: "Invalid username or password." });
      return;
    }

    const token = createToken(user);
    response.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });

  app.get("/api/auth/me", requireAuth, (request, response) => {
    response.json({ user: request.adminUser });
  });

  app.post("/api/auth/logout", requireAuth, (request, response) => {
    sessions.delete(request.adminToken);
    response.json({ ok: true });
  });

  app.get("/api/admin/content", requireAuth, async (_request, response) => {
    try {
      response.json(await readAllContent());
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

  app.post(
    "/api/admin/upload-logo",
    requireAuth,
    express.raw({ type: Object.keys(imageExtensions), limit: "2mb" }),
    async (request, response) => {
      const contentType = request.headers["content-type"]?.split(";")[0];
      const extension = imageExtensions[contentType];

      if (!extension || !Buffer.isBuffer(request.body) || request.body.length === 0) {
        response.status(400).json({ error: "Upload a PNG, JPG, WebP, or SVG logo." });
        return;
      }

      const originalName = request.headers["x-file-name"] || "logo";
      const safeName = path
        .basename(originalName, path.extname(originalName))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "logo";
      const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeName}${extension}`;

      try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), request.body);
        response.json({ path: `/uploads/${fileName}` });
      } catch (error) {
        response.status(500).json({ error: error.message });
      }
    }
  );

  app.put("/api/admin/content", requireAuth, async (request, response) => {
    const content = request.body;

    if (!content || typeof content !== "object" || Array.isArray(content)) {
      response.status(400).json({ error: "Content payload must be an object." });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [key, value] of Object.entries(content)) {
        await client.query(
          `INSERT INTO site_content (key, value, updated_at)
           VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (key)
           DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, JSON.stringify(value)]
        );
      }
      await client.query("COMMIT");
      response.json(await readAllContent());
    } catch (error) {
      await client.query("ROLLBACK");
      response.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });

  return app;
}
