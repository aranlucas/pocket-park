import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

export default {
  tests: "e2e/**/*.e2e.ts",
  workers: 1,
  retries: 0,
  timeout: 30_000,
  targets: [
    {
      engine: web(),
      app: {
        url: "http://127.0.0.1:4173",
        command: {
          executable: "pnpm",
          args: [
            "exec",
            "vite",
            "preview",
            "--host",
            "127.0.0.1",
            "--port",
            "4173",
            "--strictPort",
          ],
        },
      },
    },
  ],
} satisfies E2EConfig;
