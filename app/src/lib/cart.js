export function addCartItem(cart, productId) {
  const existing = cart.find((item) => item.productId === productId)
  if (existing) return cart.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
  return [...cart, { productId, quantity: 1 }]
}

export function updateCartItem(cart, productId, quantity) {
  if (quantity <= 0) return cart.filter((item) => item.productId !== productId)
  return cart.map((item) => item.productId === productId ? { ...item, quantity } : item)
}

export function cartTotal(cart, products) {
  return cart.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return total + (product?.price ?? 0) * item.quantity
  }, 0)
}
