# Signtech React

React/Vite rebuild of the Signtech website with shadcn-style UI primitives, separate public pages, an admin panel, and a PostgreSQL-backed content API.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment values:

```bash
cp .env.example .env
```

3. Start PostgreSQL:

```bash
docker compose up -d
```

4. Start the API:

```bash
npm run api
```

5. Start the React app in another terminal:

```bash
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Admin

Open `http://127.0.0.1:5173/admin`.

The admin panel edits the same content used by the public pages and saves it to the `site_content` PostgreSQL table as JSONB.

## Database

The API creates and seeds the `site_content` table automatically on startup. You can also run the schema manually:

```bash
npm run db:schema
```
