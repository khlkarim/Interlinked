import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // publicDir: false,
  // build: {
  //   emptyOutDir: false,
  //   rollupOptions: {
  //     input: {
  //       streamer: resolve(__dirname, 'src/plugins/youtube/streamer.ts'),
  //       listener: resolve(__dirname, 'src/plugins/youtube/listener.ts'),
  //       reloader: resolve(__dirname, 'src/workers/reloader.ts'),
  //     },
  //     output: {
  //       inlineDynamicImports: true,
  //       entryFileNames: '[name].js',
  //     },
  //   },
  //   outDir: 'public/plugins/youtube',
  //   outDir: 'public/workers',
  //   minify: false,
  // },
})
