import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { cwd } from 'node:process'

function requireChannel3Key(apiKey) {
  function checkKey(server, mode) {
    server.middlewares.use('/api/channel3', (req, res, next) => {
      if (apiKey) {
        next()
        return
      }

      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        detail: `Channel3 API key is missing. Add CHANNEL3_API_KEY to .env.local and restart the ${mode} server.`,
      }))
    })
  }

  return {
    name: 'channel3-api-key-check',
    configureServer(server) {
      checkKey(server, 'dev')
    },
    configurePreviewServer(server) {
      checkKey(server, 'preview')
    },
  }
}

function createChannel3Proxy(apiKey) {
  return {
    target: 'https://api.trychannel3.com',
    changeOrigin: true,
    headers: { 'x-api-key': apiKey },
    rewrite: (path) => path.replace(/^\/api\/channel3/, ''),
  }
}

export default defineConfig(({ mode }) => {
  const { CHANNEL3_API_KEY: apiKey = '' } = loadEnv(mode, cwd(), '')
  const proxy = apiKey
    ? { '/api/channel3': createChannel3Proxy(apiKey.trim()) }
    : {}

  return {
    plugins: [react(), requireChannel3Key(apiKey.trim())],
    server: { proxy },
    preview: { proxy },
  }
})
