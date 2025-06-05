import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      svelte(),
      viteStaticCopy({
        targets: [
          {
            src: 'static/*',
            dest: 'static',
          },
        ],
      }),
    ],
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
      assetsDir: 'static',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: 'static/[name][extname]',
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
