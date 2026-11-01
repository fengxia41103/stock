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
    },
  },
  server: {
    host: true,
    port: 5173,
    // In Docker, VITE_PROXY_TARGET points at the backend-proxy service.
    // Native dev falls back to localhost:8083.
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8083",
        changeOrigin: true,
      },
    },
    watch: {
      // usePolling helps file-change detection work reliably on mounted
      // volumes (Docker Desktop / some Linux bind mounts).
      usePolling: true,
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ["react", "react-dom", "react-router-dom"],
          vendor_mui: ["@mui/material", "@mui/icons-material"],
          vendor_query: ["@tanstack/react-query", "axios"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test-setup.js",
    exclude: ["tests/**", "node_modules/**"],
  },
});
