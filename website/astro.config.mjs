import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  outDir: './out',
  build: {
    inlineStylesheets: `never`
  },
  integrations: [tailwind()]
});
