import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const imagePattern = /data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)/g

export function extractDataImages(svgText) {
  const unique = new Map()
  for (const match of svgText.matchAll(imagePattern)) {
    const bytes = Buffer.from(match[2], 'base64')
    const hash = createHash('sha256').update(bytes).digest('hex')
    if (!unique.has(hash)) unique.set(hash, { mimeType: match[1], bytes, hash })
  }
  return [...unique.values()]
}

function parseArguments(args) {
  const values = {}
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, '')
    const value = args[index + 1]
    if (key && value) values[key] = value
  }
  if (!values.input || !values.output) throw new Error('Use --input <diretório> --output <diretório>.')
  return { input: resolve(values.input), output: resolve(values.output) }
}

function extensionFor(mimeType) {
  return mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1]
}

export async function extractCanvaAssets({ input, output }) {
  const { default: sharp } = await import('sharp')
  const svgFiles = (await readdir(input))
    .filter((name) => extname(name).toLowerCase() === '.svg')
    .sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10))

  if (!svgFiles.length) throw new Error(`Nenhum SVG encontrado em ${input}.`)

  const screenDir = join(output, 'screens')
  const assetDir = join(output, 'assets')
  await mkdir(screenDir, { recursive: true })
  await mkdir(assetDir, { recursive: true })

  const assetMap = new Map()
  for (const [index, fileName] of svgFiles.entries()) {
    const source = join(input, fileName)
    const svgBytes = await readFile(source)
    await sharp(svgBytes, { density: 144 }).resize({ width: 414 }).png().toFile(join(screenDir, `${index + 1}.png`))

    for (const asset of extractDataImages(svgBytes.toString('utf8'))) {
      if (assetMap.has(asset.hash)) continue
      const metadata = await sharp(asset.bytes).metadata()
      const extension = extensionFor(asset.mimeType)
      const outputName = `${asset.hash.slice(0, 16)}.${extension}`
      await writeFile(join(assetDir, outputName), asset.bytes)
      assetMap.set(asset.hash, {
        file: outputName,
        hash: asset.hash,
        height: metadata.height,
        mimeType: asset.mimeType,
        source: fileName,
        width: metadata.width,
      })
    }
  }

  const inventory = { assets: [...assetMap.values()], screens: svgFiles }
  await writeFile(join(output, 'inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`)
  return inventory
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paths = parseArguments(process.argv.slice(2))
  const inventory = await extractCanvaAssets(paths)
  console.log(`Renderizadas ${inventory.screens.length} telas e extraídos ${inventory.assets.length} ativos únicos.`)
}
