import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

export async function generateHomePregnancyCrop(input, output) {
  const target = resolve(output)
  await mkdir(dirname(target), { recursive: true })
  await sharp(resolve(input))
    .extract({ left: 207, top: 116, width: 190, height: 190 })
    .webp({ quality: 88, effort: 6 })
    .toFile(target)
}

export async function composeMaskedAsset(colorInput, maskInput, output, width = 420) {
  const target = resolve(output)
  const colorSource = sharp(resolve(colorInput))
  const metadata = await colorSource.metadata()
  const targetWidth = Math.min(Number(width), metadata.width)
  const targetHeight = Math.round((metadata.height / metadata.width) * targetWidth)
  const color = await sharp(resolve(colorInput)).resize(targetWidth, targetHeight).toBuffer()
  const mask = await sharp(resolve(maskInput)).resize(targetWidth, targetHeight).greyscale().toBuffer()
  await mkdir(dirname(target), { recursive: true })
  await sharp(color)
    .joinChannel(mask)
    .webp({ quality: 88, alphaQuality: 100, effort: 6 })
    .toFile(target)
}

if (process.argv[1]) {
  const [, , modeOrInput, ...args] = process.argv
  if (modeOrInput === 'mask') {
    const [color, mask, output, width] = args
    if (!color || !mask || !output) throw new Error('Use: node scripts/generate-canva-crops.mjs mask <cor> <máscara> <saída> [largura]')
    await composeMaskedAsset(color, mask, output, width)
    console.log(`Ativo com transparência criado em ${resolve(output)}.`)
    process.exit(0)
  }

  const [output] = args
  if (!modeOrInput || !output) throw new Error('Use: node scripts/generate-canva-crops.mjs <tela-5.png> <saída.webp>')
  await generateHomePregnancyCrop(modeOrInput, output)
  console.log(`Recorte criado em ${resolve(output)}.`)
}
