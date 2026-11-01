import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "/word-associations-solitaire/",
  plugins: [react()],
  test: { include: ["src/**/*.test.ts"] },
});
