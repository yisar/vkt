import { build } from 'esbuild'
import vue2Plugin from 'esbuild-vue'
import path from 'path'
import { nodeFetchPlugin, vktPlugin, requirePlugin } from './plugin.mjs'
let defineOptions = {}

export async function buildSever(options) {
  const result = await build({
    entryPoints: [path.join(options.dirname, './entry-server.mjs')],
    bundle: true,
    metafile: true,
    platform: 'node',
    format: 'cjs',
    treeShaking: true,
    outfile: 'dist/server/app.js',
    plugins: [
      nodeFetchPlugin(),
      vktPlugin({ type: 'server' }),
      requirePlugin(),
      vue2Plugin({ extractCss: true }),
    ],
    watch: process.env.WATCH === 'true',
  })
  return result
}

export async function buildClient(options) {
  const result = await build({
    entryPoints: [path.join(options.dirname, './entry-client.mjs')],
    bundle: true,
    format: 'esm',
    metafile: true,
    splitting: true,
    target: 'es2020',
    outdir: 'dist/client',
    plugins: [
      nodeFetchPlugin(),
      vktPlugin({ type: 'client' }),
      requirePlugin(),
      vue2Plugin(),
    ],
    watch: process.env.WATCH === 'true',
  })
  return result
}

export async function buildAll(options) {
  const dirname = new URL('.', import.meta.url).pathname.slice(1)
  options.dirname = dirname
  options.entry = path.join(process.cwd(), options.e)
  defineOptions = options

  const p1 = async () => {
    return await buildSever(options)
  }
  const p2 = async () => {
    return await buildClient(options)
  }

  const [r1, r2] = await Promise.all([p1(), p2()])
}

export function getOptions() {
  return defineOptions
}
