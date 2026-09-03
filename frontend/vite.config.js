import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/customHabits": "http://127.0.0.1:8000",
      "/customHabitData": "http://127.0.0.1:8000",
      "/customHabitAll": "http://127.0.0.1:8000",
      "/customHabitReason": "http://127.0.0.1:8000",
    },
  },
});
