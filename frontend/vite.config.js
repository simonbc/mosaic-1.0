import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [svelte()],
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@data': path.resolve(__dirname, 'src/data'),
        '@actions': path.resolve(__dirname, 'src/actions'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
    base: '/',
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE || ''),
    },
    server: {
        host: 'mosaic.localhost',
        port: 5173,
    },
  }
})
