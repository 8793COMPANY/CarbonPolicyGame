import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CarbonPolicyGame/'  // ✅ GitHub 리포지토리 이름과 동일
})