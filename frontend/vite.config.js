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
      "@lib/charts": resolve(__dirname, "src/lib/charts/index.js"),
      "@lib/layout": resolve(__dirname, "src/lib/layout/index.js"),
      "@lib/display": resolve(__dirname, "src/lib/display/index.js"),
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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ["react", "react-dom", "react-router-dom"],
          vendor_mui: ["@mui/material", "@mui/icons-material"],
          vendor_echarts: ["echarts", "echarts-for-react"],
          vendor_query: ["@tanstack/react-query", "axios"],
        },
      },
    },
  },
});
