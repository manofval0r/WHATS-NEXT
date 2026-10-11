import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // The single entry chunk was 1.88 MB (563 KB gzipped) because everything
    // — React, D3, Framer Motion, Three.js, html2canvas, highlight.js — was
    // bundled together and downloaded before the landing page could paint.
    //
    // Splitting at the vendor boundary means the browser fetches only what
    // the current route needs, in parallel, and the landing page stops
    // waiting on Three.js it will never use.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Never bundle these: they are large, rarely change, and pinning
          // them keeps their cache valid across application deploys.
          if (!id.includes('node_modules')) return

          if (id.includes('three')) return 'vendor-three'
          if (id.includes('highlight.js')) return 'vendor-highlight'
          if (id.includes('d3-') || id.includes('d3\\')) return 'vendor-d3'
          if (id.includes('framer-motion') || id.includes('motion-dom')
              || id.includes('motion-utils')) return 'vendor-motion'
          if (id.includes('@xyflow') || id.includes('reactflow')) return 'vendor-graph'
          if (id.includes('react-markdown') || id.includes('remark-')
              || id.includes('micromark') || id.includes('hast-')
              || id.includes('unist-') || id.includes('purify')) return 'vendor-markdown'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('react-dom') || id.includes('/react/')
              || id.includes('scheduler')) return 'vendor-react'

          // Everything else — html2pdf and its html2canvas/jsPDF dependency
          // among them — is left to Rollup, so modules reached only through
          // import() stay in their own async chunk.
          return undefined
        },
      },
    },
  },
})