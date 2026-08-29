import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { formatCurrency, products } from '../data/storeData.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { addCartItem } from '../lib/cart.js'

export default function ShopPage() {
  const [cart, setCart] = useLocalData('mamabloom:cart', [])
  const [favorites, setFavorites] = useLocalData('mamabloom:shop-favorites', [])
  const [tab, setTab] = useState('Promo')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const visibleProducts = products.filter((product) => {
    const matchesTab = tab === 'Promo' || favorites.includes(product.id)
    const matchesSearch = !normalizedSearch || `${product.name} ${product.brand}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    return matchesTab && matchesSearch
  })

  function addProduct(product) {
    setCart((current) => addCartItem(current, product.id))
    setMessage(`${product.name} foi adicionado ao carrinho.`)
  }

  function toggleFavorite(productId) {
    setFavorites((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId])
  }

  return (
    <AppShell
      className="shop-prototype"
      navTone="yellow"
      header={({ openMenu }) => (
        <header className="shop-prototype__header">
          <h1>Loja</h1>
          <PrototypeToolbar onMenu={openMenu} />
        </header>
      )}
    >
      <Link className="shop-prototype__promo" to="/apoio" aria-label="Ir para a Central de apoio">
        <img src={`${import.meta.env.BASE_URL}prototype/store-promo.webp`} alt="Enxoval de bebê em destaque" />
        <div><strong>Faça o enxoval do<br />seu bebê aqui!</strong><small>Toque para acessar a Central de apoio</small></div>
      </Link>
      <div className="shop-prototype__dots" aria-hidden="true"><i /><i /><i /></div>

      <div className="shop-prototype__search">
        <h2>Compre aqui:</h2>
        <label><Icon name="search" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquise aqui..." aria-label="Pesquisar produtos" /></label>
      </div>

      <section className="shop-prototype__catalog">
        <nav className="shop-prototype__tabs" aria-label="Filtros da loja">
          <button className={tab === 'Promo' ? 'is-active' : ''} type="button" onClick={() => setTab('Promo')}>Promo</button>
          <button className={tab === 'Favorito' ? 'is-active' : ''} type="button" onClick={() => setTab('Favorito')}>Favorito</button>
          <Link to="/carrinho">Carrinho{cartCount ? ` (${cartCount})` : ''}</Link>
        </nav>

        {message && <p className="shop-prototype__message" role="status">{message}</p>}
        <div className="shop-prototype__products" aria-label="Produtos">
          {visibleProducts.length ? visibleProducts.map((product) => (
            <article key={product.id}>
              <span className="shop-prototype__discount">30%</span>
              <img src={`${import.meta.env.BASE_URL}prototype/${product.image}`} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.brand}</p>
              <footer>
                <strong>{formatCurrency(product.price)}</strong>
                <button className={favorites.includes(product.id) ? 'shop-prototype__favorite is-favorite' : 'shop-prototype__favorite'} type="button" onClick={() => toggleFavorite(product.id)} aria-label={`${favorites.includes(product.id) ? 'Remover' : 'Adicionar'} ${product.name} dos favoritos`}>☆</button>
                <button className="shop-prototype__add" type="button" onClick={() => addProduct(product)} aria-label={`Adicionar ${product.name} ao carrinho`}><Icon name="bag" size={15} /></button>
              </footer>
            </article>
          )) : <p className="shop-prototype__empty">Nenhum produto encontrado.</p>}
        </div>
      </section>
    </AppShell>
  )
}
