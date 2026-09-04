// Dynamically sets the Prisma datasource provider based on the environment.
//
// Prisma requires the datasource `provider` to be a static literal (it does not
// support env()). The schema is provider-agnostic (String columns, no DB
// enums), so it runs identically on SQLite (local dev) and PostgreSQL
// (production on Render).
//
// Detection order:
//   1. `PRISMA_PROVIDER` env var if set ("sqlite" | "postgresql")
//   2. `DATABASE_URL`: "postgresql://..." -> postgresql, otherwise sqlite
//
// Usage: node scripts/prisma-provider.mjs
// Run before any `prisma generate`, `prisma db push`, `prisma migrate *`, etc.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(here, "..", "prisma", "schema.prisma");

const explicit = process.env.PRISMA_PROVIDER?.trim().toLowerCase();
const dbUrl = (process.env.DATABASE_URL || "").trim().toLowerCase();

let target;
if (explicit) {
  if (!["sqlite", "postgresql"].includes(explicit)) {
    console.error(`[prisma-provider] Unknown PRISMA_PROVIDER: ${explicit}`);
    process.exit(1);
  }
  target = explicit;
} else {
  target = dbUrl.startsWith("postgresql:") ? "postgresql" : "sqlite";
}

const schema = readFileSync(schemaPath, "utf8");
const current = /^\s*provider\s*=\s*"(sqlite|postgresql)"/m.exec(schema);

if (!current) {
  console.error(
    "[prisma-provider] Could not find datasource provider in schema.prisma"
  );
  process.exit(1);
}

if (current[1] === target) {
  console.log(`[prisma-provider] Schema already on: ${target}`);
} else {
  const updated = schema.replace(
    /^(\s*provider\s*=\s*")(sqlite|postgresql)(")/m,
    `$1${target}$3`
  );
  writeFileSync(schemaPath, updated, "utf8");
  console.log(`[prisma-provider] Switched schema to: ${target}`);
}