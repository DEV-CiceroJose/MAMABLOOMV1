import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { formatCurrency, products } from '../data/storeData.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { cartTotal, updateCartItem } from '../lib/cart.js'

export default function CartPage() {
  const [cart, setCart] = useLocalData('mamabloom:cart', [])
  const [completed, setCompleted] = useState(false)
  const total = cartTotal(cart, products)

  function simulateOrder() {
    setCompleted(true)
    setCart([])
  }

  return (
    <AppShell className="commerce-prototype" header={({ openMenu }) => <header className="commerce-prototype__header"><Link to="/loja" aria-label="Voltar para a loja"><Icon name="arrowLeft" /></Link><h1>Meu carrinho</h1><PrototypeToolbar onMenu={openMenu} /></header>}>
      {completed ? (
        <section className="order-success"><span><Icon name="check" size={30} /></span><h2>Simulação concluída!</h2><p>Nenhuma cobrança foi realizada. O checkout real será conectado ao serviço de pagamentos em uma etapa futura.</p></section>
      ) : cart.length ? (
        <>
          <section className="commerce-prototype__cart-list" aria-label="Itens do carrinho">
            {cart.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId)
              if (!product) return null
              return <article key={item.productId}><img src={`${import.meta.env.BASE_URL}prototype/${product.image}`} alt="" /><div><strong>{product.name}</strong><small>{product.brand} · {formatCurrency(product.price)}</small></div><div className="quantity-control"><button type="button" onClick={() => setCart((current) => updateCartItem(current, item.productId, item.quantity - 1))} aria-label={`Diminuir ${product.name}`}>−</button><b>{item.quantity}</b><button type="button" onClick={() => setCart((current) => updateCartItem(current, item.productId, item.quantity + 1))} aria-label={`Aumentar ${product.name}`}>+</button></div></article>
            })}
          </section>
          <section className="cart-summary"><div><span>Subtotal</span><strong>{formatCurrency(total)}</strong></div><div><span>Entrega</span><strong>Calculada no checkout</strong></div><hr /><div className="cart-summary__total"><span>Total</span><strong>{formatCurrency(total)}</strong></div></section>
          <aside className="demo-notice"><Icon name="lock" /><p>Ambiente demonstrativo: nenhum pagamento, pedido ou dado financeiro será processado.</p></aside>
          <button className="button button--primary button--wide" type="button" onClick={simulateOrder}>Simular finalização</button>
        </>
      ) : <div className="empty-state cart-empty"><Icon name="bag" size={31} /><h2>Seu carrinho está vazio</h2><p>Escolha itens na loja para montar seu pedido.</p><Link className="button button--primary" to="/loja">Explorar produtos</Link></div>}
    </AppShell>
  )
}
