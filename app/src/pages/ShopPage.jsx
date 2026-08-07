import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { formatCurrency, products } from '../data/storeData.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { addCartItem } from '../lib/cart.js'

const categories = ['Todos', ...new Set(products.map((product) => product.category))]

export default function ShopPage() {
  const [cart, setCart] = useLocalData('mamabloom:cart', [])
  const [category, setCategory] = useState('Todos')
  const [message, setMessage] = useState('')
  const visibleProducts = category === 'Todos' ? products : products.filter((product) => product.category === category)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  function addProduct(product) {
    setCart((current) => addCartItem(current, product.id))
    setMessage(`${product.name} foi adicionado ao carrinho.`)
  }

  return (
    <AppShell>
      <PageTitle
        eyebrow="Seleção MamaBloom"
        title="Loja"
        action={<Link className="round-action cart-action" to="/carrinho" aria-label={`Carrinho com ${cartCount} itens`}><Icon name="bag" />{cartCount > 0 && <span>{cartCount}</span>}</Link>}
      />

      <section className="shop-hero"><div><p className="eyebrow eyebrow--light">Cuidado que acompanha</p><h2>Itens pensados para sua jornada</h2><p>Uma vitrine demonstrativa de produtos MamaBloom.</p></div><Icon name="sparkles" size={40} /></section>

      <div className="category-tabs" aria-label="Categorias da loja">
        {categories.map((item) => <button className={category === item ? 'is-active' : ''} type="button" key={item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>

      {message && <p className="shop-message" role="status">{message}</p>}
      <section className="product-grid" aria-label="Produtos">
        {visibleProducts.map((product) => (
          <article className={`product-card product-card--${product.tone}`} key={product.id}>
            <span className="product-card__art"><Icon name={product.icon} size={34} /></span>
            <small>{product.category}</small>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <footer><strong>{formatCurrency(product.price)}</strong><button type="button" onClick={() => addProduct(product)} aria-label={`Adicionar ${product.name}`}><Icon name="plus" size={19} /></button></footer>
          </article>
        ))}
      </section>

      <Link className="plans-banner" to="/planos"><div><p className="eyebrow">MamaBloom+</p><h2>Conheça nossos planos</h2><span>Mais recursos para acompanhar sua jornada</span></div><Icon name="chevronRight" /></Link>
    </AppShell>
  )
}
