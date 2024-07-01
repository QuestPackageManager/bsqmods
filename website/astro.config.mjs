import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import playformCompress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  outDir: './out',
  integrations: [tailwind(), playformCompress()]
});
