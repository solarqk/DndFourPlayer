import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const base = process.env.VITE_BASE ?? "/"; // default for local/K8s
  return {
    plugins: [react()],
    base,
  };
});
