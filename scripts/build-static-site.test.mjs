import assert from 'node:assert/strict'
import { mkdtemp, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { buildStaticSite } from './build-static-site.mjs'

test('empacota landing e aplicativo no mesmo diretório estático', async () => {
  const output = await mkdtemp(join(tmpdir(), 'mamabloom-site-'))
  await buildStaticSite({ rootDir: process.cwd(), outputDir: output })

  assert.match(await readFile(join(output, 'index.html'), 'utf8'), /MamaBloom/i)
  assert.match(await readFile(join(output, 'app', 'index.html'), 'utf8'), /\/app\/assets\//)
  assert.equal((await stat(join(output, 'css'))).isDirectory(), true)
  assert.equal((await stat(join(output, 'app', 'assets'))).isDirectory(), true)
})

test('recusa usar a raiz do repositório como saída', async () => {
  await assert.rejects(
    buildStaticSite({ rootDir: process.cwd(), outputDir: process.cwd() }),
    /saída segura/i,
  )
})
