// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// The browser needs these two public values at build time. Lovable normally
// injects them as VITE_* variables, but published builds may omit that layer.
// Environment values remain authoritative; these public fallbacks only prevent
// the app from crashing when the deployment environment does not provide them.
const mode = process.env["NODE_ENV"] === "development" ? "development" : "production";
const env = loadEnv(mode, process.cwd(), "");
const publicBackendUrl =
  process.env["VITE_SUPABASE_URL"] ??
  env["VITE_SUPABASE_URL"] ??
  "https://bnxuyyzdmiqhgzmppmsv.supabase.co";
const publicBackendKey =
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable__1W5giL_316aHMismZmiWQ_YAoa7HRv";

export default defineConfig({
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(publicBackendUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publicBackendKey),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
