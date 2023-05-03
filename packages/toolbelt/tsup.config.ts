import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  splitting: true,
  sourcemap: false,
  clean: true,
  format: ['esm', 'cjs', 'iife'],
  target: ['es2022'],
  treeshake: true,
  outDir: 'build',
  // minify: !options.watch,
}))
