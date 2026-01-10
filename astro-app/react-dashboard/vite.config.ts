import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Base path pour le SPA - toutes les routes commencent par /app
  base: "/app/",
  
  server: {
    host: "::",
    port: 3001,
  },
  
  build: {
    // Output vers le dossier public d'Astro
    outDir: "../public/app",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Noms de fichiers fixes pour faciliter l'intégration avec Astro
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
