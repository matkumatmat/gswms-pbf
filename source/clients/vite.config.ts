import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteSingleFile(),
  ],
    build: {
    minify: true,
    outDir: 'dist', // tetap default
  },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },  

})
