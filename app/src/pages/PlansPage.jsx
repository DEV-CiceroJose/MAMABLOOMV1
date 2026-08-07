import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { formatCurrency, plans } from '../data/storeData.js'
import { useLocalData } from '../hooks/useLocalData.js'

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useLocalData('mamabloom:selected-plan', 'essencial')
  const [message, setMessage] = useState('')

  function choosePlan(plan) {
    setSelectedPlan(plan.id)
    setMessage(`${plan.name} foi selecionado para demonstração. Nenhuma cobrança foi realizada.`)
  }

  return (
    <AppShell>
      <PageTitle eyebrow="MamaBloom+" title="Planos para cada jornada" />
      <section className="plans-intro"><span><Icon name="sparkles" /></span><div><h2>Escolha o cuidado que combina com você</h2><p>Compare os recursos previstos para cada modalidade.</p></div></section>
      {message && <p className="plan-message" role="status">{message}</p>}
      <section className="plans-list" aria-label="Planos disponíveis">
        {plans.map((plan) => (
          <article className={plan.featured ? 'plan-card plan-card--featured' : 'plan-card'} key={plan.id}>
            {plan.featured && <span className="plan-card__badge">Mais escolhido</span>}
            <header><div><p>MamaBloom</p><h2>{plan.name}</h2></div><strong>{plan.price ? <>{formatCurrency(plan.price)}<small>/mês</small></> : 'Grátis'}</strong></header>
            <p>{plan.description}</p>
            <ul>{plan.features.map((feature) => <li key={feature}><Icon name="check" size={17} />{feature}</li>)}</ul>
            <button className={selectedPlan === plan.id ? 'button button--ghost button--wide' : 'button button--primary button--wide'} type="button" onClick={() => choosePlan(plan)}>{selectedPlan === plan.id ? 'Plano selecionado' : 'Escolher plano'}</button>
          </article>
        ))}
      </section>
      <aside className="demo-notice"><Icon name="lock" /><p>Os planos são demonstrativos nesta versão. Assinaturas e cobranças ainda não estão habilitadas.</p></aside>
    </AppShell>
  )
}
