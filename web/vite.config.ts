import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In dev, Vite serves the app on :5173 and forwards API and MCP calls to the Rust server.
// Run the server with PUBLIC_URL=http://localhost:5173 (`task web:dev` does), so sign-in
// links open this app and the same-origin check accepts its requests.
const api = "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": api,
      "/health": api,
      "^/[^/]+/mcp$": api,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
