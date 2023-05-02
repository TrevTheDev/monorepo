/* eslint-disable */
import { defineConfig, UserConfigExport } from 'vitest/config'

const config: UserConfigExport = {
  test: {
    include: ['./packages/validate/tests/**/*.ts', './packages/*/tests/**/*.js'],
  },
}

if (process.env.DEBUG === 'jest') {
  if (config.test) config.test.testTimeout = 5 * 60 * 1000
}

export default defineConfig({
  test: {
    include: ['./packages/**/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['./packages/**/tests/**/.archive'],
  },
})
