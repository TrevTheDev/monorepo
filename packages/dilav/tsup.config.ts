import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  splitting: true,
  sourcemap: false,
  clean: true,
  format: ['esm'],
  target: ['es2022'],
  minify: !options.watch,
}))
