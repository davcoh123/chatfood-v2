// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

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

  adapter: vercel({
    webAnalytics: { enabled: true }
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