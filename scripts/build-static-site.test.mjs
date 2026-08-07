import assert from 'node:assert/strict'
import { exec } from 'node:child_process'
import { mkdtemp, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import test from 'node:test'
import { buildStaticSite } from './build-static-site.mjs'

const execAsync = promisify(exec)

test('empacota landing e aplicativo no mesmo diretório estático', async () => {
  const output = await mkdtemp(join(tmpdir(), 'mamabloom-site-'))
  await buildStaticSite({ rootDir: process.cwd(), outputDir: output })

  const landingHtml = await readFile(join(output, 'index.html'), 'utf8')

  assert.match(landingHtml, /MamaBloom/i)
  assert.equal(landingHtml.match(/href="\/app\/"/g)?.length, 2)
  assert.equal(landingHtml.match(/>Acessar o app<\/a>/g)?.length, 2)
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

test('inclui o aplicativo no workspace usado pelo deploy', async () => {
  const { stdout } = await execAsync('pnpm --recursive list --depth=-1 --json', {
    cwd: process.cwd(),
  })
  const projects = JSON.parse(stdout)

  assert.equal(projects.some((project) => project.name === 'mamabloom-app'), true)
})
