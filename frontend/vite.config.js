import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/habitTracker": "http://127.0.0.1:8000",
      "/habitTrackerUpdate": "http://127.0.0.1:8000",
      "/habitTrackerDeleteAll": "http://127.0.0.1:8000",
      "/excuse": "http://127.0.0.1:8000",
    },
  },
});
