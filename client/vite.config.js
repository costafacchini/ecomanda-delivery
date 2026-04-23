import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const configDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, configDir, '')
  const apiProxyTarget = env.API_PROXY_TARGET || env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5001'

  return {
    plugins: [react()],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    server: {
      proxy: {
        '/resources': apiProxyTarget,
        '/login': apiProxyTarget,
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
      clearMocks: true,
      coverage: {
        provider: 'v8',
        reportsDirectory: '../react-coverage',
      },
    },
  }
})
