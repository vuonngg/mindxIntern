import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // FIX: Thêm thuộc tính 'base' để đảm bảo tài nguyên được tham chiếu từ gốc (/)
  base: '/', 
  plugins: [react()],
})