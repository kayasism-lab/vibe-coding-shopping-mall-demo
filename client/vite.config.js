import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /** 5173 점유 시 다른 포트로 뜨면 터미널의 Local URL(예: 5174)로 접속해야 합니다. */
    strictPort: false,
  },
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
