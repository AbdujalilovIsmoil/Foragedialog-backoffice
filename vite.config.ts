import * as path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Agar boshqa ckeditor5 modullari chalkashsa, majburiy alias
      "@ckeditor/ckeditor5-react": path.resolve(
        __dirname,
        "node_modules/@ckeditor/ckeditor5-react"
      ),
      "ckeditor5-build-oks": path.resolve(
        __dirname,
        "node_modules/ckeditor5-build-oks"
      ),
    },
  },
  optimizeDeps: {
    include: ["@ckeditor/ckeditor5-react", "@ckeditor/ckeditor5-build-classic"],
  },
});
