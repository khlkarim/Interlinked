import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // build: {
  //   rollupOptions: {
  //     input: {
  //       streamer: resolve(__dirname, 'src/classes/plugins/youtube/streamer.ts'),
  //       listener: resolve(__dirname, 'src/classes/plugins/youtube/listener.ts'),
  //     },
  //     output: {
  //       inlineDynamicImports: true,
  //     },
  //   },
  //   outDir: 'dist',
  //   minify: false,
  // },
})
