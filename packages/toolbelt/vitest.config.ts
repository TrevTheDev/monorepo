/* eslint-disable */
import { defineConfig } from 'vitest/config'

// const config: UserConfigExport = {
//   test: {
//     include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
//   },
// }

// if (process.env.DEBUG === 'jest') {
//   if (config.test) config.test.testTimeout = 5 * 60 * 1000
// }

export default defineConfig({
  test: {
    include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['{archive,.archive}'],
  },
})
