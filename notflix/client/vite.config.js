import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:6060'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

//  1.npm install firebase react-firebase-hooks ->for install

// 2.createv file for firebase config

// 3.writ function for signin,signup,signout in firebase.js

//4.import all functions in login.jsx

//5.custom notification system implemented