/* eslint-disable */
import { defineConfig, UserConfigExport } from 'vitest/config'

const config: UserConfigExport = {
  test: {
    include: ['.//tests/**/*.ts', './tests/**/*.js'],
  },
}

if (process.env.DEBUG === 'jest') {
  if (config.test) config.test.testTimeout = 5 * 60 * 1000
}

export default defineConfig({
  test: {
    include: ['./tests/**/*.ts'],
    exclude: ['./tests/archive/**/*.ts'],
  },
})
