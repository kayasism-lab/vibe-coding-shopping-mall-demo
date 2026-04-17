import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 동적 import 시 Vite deps 캐시에서 모듈 로드 실패 방지 (Failed to fetch dynamically imported module)
  optimizeDeps: {
    include: ['@tosspayments/tosspayments-sdk'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
