// Cross-platform production start command.
// Render (and every platform) injects PORT; fall back to 3000 for local tests.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.join(here, "..", "node_modules", "next", "dist", "bin", "next");
const port = process.env.PORT || "3000";

const child = spawn(process.execPath, [nextBin, "start", "-p", port], {
  stdio: "inherit",
});

const forward = (signal) => () => child.kill(signal);
process.on("SIGINT", forward("SIGINT"));
process.on("SIGTERM", forward("SIGTERM"));

child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (err) => {
  console.error("[start:prod] failed to start Next.js:", err);
  process.exit(1);
});