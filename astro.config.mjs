import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://touchpilot.dev",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [
    tailwind({ applyBaseStyles: true }),
    sitemap(),
  ],
  vite: {
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  },
});