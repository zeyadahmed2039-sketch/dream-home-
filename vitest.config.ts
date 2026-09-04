import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        "src/types/**",
        "src/components/ui/**",
        ".next/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": r("./src"),
    },
  },
});
