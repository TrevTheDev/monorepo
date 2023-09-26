import { defineConfig } from 'tsup'
import { glsl } from 'esbuild-plugin-glsl'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ['cjs'],
  target: ['es2022'],
  treeshake: true,
  // bundle: true,
  noExternal: ['wgpu-matrix', 'gl-matrix'],
  outDir: 'build',
  // skipNodeModulesBundle: false,
  minify: !options.watch,
  esbuildPlugins: [glsl()],
  assetNames: 'images/[name]',
  loader: { '.webp': 'dataurl' },
  bundle: true,
}))
