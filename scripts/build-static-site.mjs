import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { join, parse, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const landingEntries = ['index.html', 'css', 'img', 'js', 'lib']

function assertSafeOutput(rootDir, outputDir) {
  if (outputDir === rootDir || outputDir === parse(outputDir).root) {
    throw new Error('Informe uma saída segura, diferente da raiz do repositório ou do disco.')
  }
}

async function assertExists(path, label) {
  try {
    await stat(path)
  } catch {
    throw new Error(`${label} não encontrado em ${path}.`)
  }
}

export async function buildStaticSite({ rootDir, outputDir }) {
  const root = resolve(rootDir)
  const output = resolve(outputDir)
  const appBuild = join(root, 'app', 'dist')

  assertSafeOutput(root, output)
  await assertExists(join(root, 'index.html'), 'Landing page')
  await assertExists(join(appBuild, 'index.html'), 'Build do aplicativo')

  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })

  for (const entry of landingEntries) {
    await cp(join(root, entry), join(output, entry), { recursive: true })
  }
  await cp(appBuild, join(output, 'app'), { recursive: true })
  return output
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  const rootDir = resolve(process.cwd())
  const outputDir = resolve(rootDir, 'site-dist')
  await buildStaticSite({ rootDir, outputDir })
  console.log(`Site estático criado em ${outputDir}.`)
}
