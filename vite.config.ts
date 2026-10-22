import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    // src/main.tsx registers /sw.js itself; public/manifest.webmanifest stays hand-written.
    VitePWA({
      injectRegister: false,
      manifest: false,
      workbox: {
        cacheId: "pocket-park",
        globPatterns: ["**/*"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
