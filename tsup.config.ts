import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/extension.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['cjs','esm'],
  external: ['vscode'],
})