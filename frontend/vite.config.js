import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@Components": resolve(__dirname, "src/components"),
      "@Views": resolve(__dirname, "src/views"),
      "@Layouts": resolve(__dirname, "src/layouts"),
      "@Utils": resolve(__dirname, "src/utils"),
      "@fengxia41103/storybook": resolve(__dirname, "src/lib/storybook/index.jsx"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8083",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
  },
});
