import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["test/**/*.test.{ts,tsx}"],
    environment: "node",
    fileParallelism: false,
    maxWorkers: 1,
  },
});
