import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "我的起卦",
        short_name: "起卦",
        description: "周易六爻起卦占卜应用",
        theme_color: "#667eea",
        background_color: "#1a1a2e",
        display: "standalone",
        start_url: "/divination-app/",
        scope: "/divination-app/",
        icons: [
          {
            src: "/divination-app/icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,json}"],
      },
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
      renderModernChunks: false,
    }),
  ],
  base: "/divination-app/",
});
