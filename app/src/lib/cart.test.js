import { describe, expect, it } from 'vitest'
import { addCartItem, cartTotal, updateCartItem } from './cart.js'

describe('carrinho local', () => {
  it('adiciona e incrementa um produto', () => {
    const first = addCartItem([], 'diario')
    expect(addCartItem(first, 'diario')).toEqual([{ productId: 'diario', quantity: 2 }])
  })

  it('remove itens quando a quantidade chega a zero', () => {
    expect(updateCartItem([{ productId: 'diario', quantity: 1 }], 'diario', 0)).toEqual([])
  })

  it('calcula o total usando o catálogo', () => {
    expect(cartTotal([{ productId: 'diario', quantity: 2 }], [{ id: 'diario', price: 12.5 }])).toBe(25)
  })
})
