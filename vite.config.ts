import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const CSP =
  "default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; " +
  "connect-src 'self' https://api.openai.com; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'"

// Added only to the production build: the dev server relies on inline scripts for HMR.
const cspPlugin = (): Plugin => ({
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
})

export default defineConfig({
  base: './',
  plugins: [react(), cspPlugin()],
})
