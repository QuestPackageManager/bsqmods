import { defineConfig } from "astro/config";
import playformCompress from "@playform/compress";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  outDir: "./out",
  integrations: [
    react(),
    playformCompress({
      Image: false
    })
  ]
});
