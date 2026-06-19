import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      // TEMPORARY (pre-RLS-lockdown safety): ship a self-unregistering SW that
      // purges caches on existing clients. D1 confirmed a stale pre-Phase-B
      // cached bundle caused a false "Could not sync" save failure. This stops
      // users from running old cached bundles. Re-enable a hardened PWA later
      // (update prompt + version check + localStorage draft-persistence).
      selfDestroying: true,
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-icon.svg"],
      manifest: {
        name: "Pathfinder — Career Guidance",
        short_name: "Pathfinder",
        description:
          "Pathfinder is a comprehensive career guidance and employability platform for students.",
        lang: "ka",
        theme_color: "#428A72",
        background_color: "#FAF9F5",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the built app shell + assets (Vite-hashed filenames handled by Workbox).
        globPatterns: ["**/*.{js,css,html,ico,svg,png,woff,woff2}"],
        // Main bundle is ~3 MB; raise the 2 MiB default so it is precached for offline.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // SPA offline fallback for navigations; never intercept Supabase/API calls.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /\/auth\//, /supabase/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        // Keep the SW off in `vite dev` to avoid caching surprises during development.
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
