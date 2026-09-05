// Generates a LOCAL-DEV-ONLY SQLite Prisma schema from the committed
// PostgreSQL schema (prisma/schema.prisma).
//
// prisma/schema.prisma is committed statically as `provider = "postgresql"` so
// the production build and `prisma migrate deploy` always use PostgreSQL (the
// Render target). This script derives a SQLite variant at
// prisma/schema.dev.prisma (gitignored) so local development keeps its
// zero-setup SQLite workflow WITHOUT ever mutating the committed schema.
//
// The two schemas share identical models; only the datasource block differs.
// Run it via the `db:*` npm scripts, e.g.:
//   node scripts/prisma-dev-schema.mjs && prisma db push --schema prisma/schema.dev.prisma
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const sourcePath = path.join(root, "prisma", "schema.prisma");
const devPath = path.join(root, "prisma", "schema.dev.prisma");

const schema = readFileSync(sourcePath, "utf8");

const devSchema = schema
  .replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"')
  .replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url      = "file:./dev.db"');

if (
  !devSchema.includes('provider = "sqlite"') ||
  !devSchema.includes('url      = "file:./dev.db"')
) {
  console.error(
    "[prisma-dev-schema] Could not derive a SQLite dev schema from prisma/schema.prisma. Expected datasource provider \"postgresql\" with url = env(\"DATABASE_URL\")."
  );
  process.exit(1);
}

writeFileSync(devPath, devSchema, "utf8");
console.log(
  "[prisma-dev-schema] Wrote prisma/schema.dev.prisma (SQLite) from prisma/schema.prisma"
);