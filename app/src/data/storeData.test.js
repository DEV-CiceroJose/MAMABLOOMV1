import { describe, expect, it } from 'vitest'
import { products } from './storeData.js'

describe('catálogo visual da loja', () => {
  it('mantém os seis produtos exibidos no protótipo com imagens próprias', () => {
    expect(products).toHaveLength(6)
    expect(products.every((product) => product.image?.endsWith('.webp'))).toBe(true)
    expect(products.map((product) => product.id)).toEqual([
      'perfume', 'chupeta', 'berco', 'lenco-umedecido', 'fraldas', 'leite-em-po',
    ])
  })
})
