import { furuMcpBuild } from './mcp/build.mjs';
import { webSecurity } from './scripts/web-security.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [webSecurity({ connectSources: ["https://api.openai.com","https://generativelanguage.googleapis.com","https://*.blob.core.windows.net"] }), furuMcpBuild("character-sheet-maker", 45933), react()],
  base: command === 'build' ? './' : '/',
  server: {
    port: 5176,
    strictPort: true,
  },
}))
