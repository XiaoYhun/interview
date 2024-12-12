import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import commonjs from "@rollup/plugin-commonjs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), commonjs()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
