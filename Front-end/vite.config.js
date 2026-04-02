import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const { visualizer } = await import("rollup-plugin-visualizer");

  return {
    plugins: [
      tailwindcss(),
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
      force: true,
    },
    resolve: {
      alias: {
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      },
    },
  };
});
