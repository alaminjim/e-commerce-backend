import { existsSync, readFileSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Load .env manually (no dotenv dependency) so Prisma CLI works locally.
// On Render/Vercel etc. env vars are injected by the platform instead.
if (!process.env.DATABASE_URL && existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && match[1] && !(match[1] in process.env)) {
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  }
}

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Empty default so `prisma generate` never crashes when DATABASE_URL is
    // not set yet (it isn't needed for generation).
    url: env("DATABASE_URL", ""),
  },
});
