// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  
  integrations: [
    react({
      include: ['**/react/**', '**/components/**/*.tsx'],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },

  adapter: node({
    mode: 'standalone',
  }),

  // SEO optimizations
  site: 'https://chatfood.fr',
  trailingSlash: 'never',
  
  // Prefetch links for better UX
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});