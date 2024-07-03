import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import playformCompress from "@playform/compress";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  outDir: './out',
  integrations: [react(), tailwind(), playformCompress()]
});
