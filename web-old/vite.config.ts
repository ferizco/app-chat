import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:2222', // arahkan semua /api ke backend Fiber
    },
  },
});
