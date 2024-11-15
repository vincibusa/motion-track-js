import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        injectData: {
          csp: `
            default-src 'self';
            script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net;
            style-src 'self' 'unsafe-inline';
            img-src 'self' data:;
            connect-src 'self';
            font-src 'self';
          `,
        },
      },
      minify: true,
      template: '/index.html',
    }),
  ],
});