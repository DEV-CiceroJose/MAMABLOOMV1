import assert from 'node:assert/strict'
import test from 'node:test'
import { extractDataImages } from './extract-canva-assets.mjs'

test('extracts and deduplicates embedded Canva images', () => {
  const png = Buffer.from('same-image').toString('base64')
  const svg = `<svg><image href="data:image/png;base64,${png}"/><image href="data:image/png;base64,${png}"/></svg>`
  const images = extractDataImages(svg)

  assert.equal(images.length, 1)
  assert.equal(images[0].mimeType, 'image/png')
  assert.deepEqual(images[0].bytes, Buffer.from('same-image'))
})
