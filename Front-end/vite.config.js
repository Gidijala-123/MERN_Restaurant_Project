import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const { visualizer } = await import("rollup-plugin-visualizer");

  return {
    plugins: [
      react(),
      visualizer({
        filename: "dist/bundle-stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    base: "./",
    server: {
      port: 3000,
      open: true,
    },
    resolve: {
      alias: {
        // Add any aliases if needed
      },
    },
  };
});
