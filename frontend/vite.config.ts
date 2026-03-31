import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/nakama": {
        target: "http://127.0.0.1:7350",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nakama/, ""),
        ws: true,
      },
    },
  },
});
