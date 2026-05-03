import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['admin/src/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['admin/tests/**', 'e2e/**', 'node_modules/**'],
  },
})
