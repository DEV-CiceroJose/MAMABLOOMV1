import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { useLocalData } from '../hooks/useLocalData.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function InstitutionalPage() {
  const [, setRequests] = useLocalData('mamabloom:institutional-requests', [])
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ institution: '', name: '', email: '', profile: 'Gestão pública', audience: '', message: '' })

  function submitRequest(event) {
    event.preventDefault()
    setRequests((current) => [...current, { ...form, id: createId(), createdAt: new Date().toISOString() }])
    setSent(true)
  }

  return (
    <AppShell>
      <PageTitle eyebrow="MamaBloom Instituições" title="Cuidado em escala" />
      <section className="institutional-hero"><div><p className="eyebrow eyebrow--light">Solução B2G e corporativa</p><h2>Apoio à jornada materna com visão de impacto</h2><p>Uma proposta para organizações que desejam ampliar acolhimento, informação e acompanhamento.</p></div><Icon name="building" size={46} /></section>

      <section className="impact-grid" aria-label="Benefícios institucionais">
        <article><Icon name="users" /><strong>Acolhimento ampliado</strong><span>Experiência digital acessível para gestantes e famílias.</span></article>
        <article><Icon name="chart" /><strong>Visão de impacto</strong><span>Indicadores agregados previstos para apoiar programas.</span></article>
        <article><Icon name="shield" /><strong>Privacidade desde a base</strong><span>Arquitetura futura orientada à proteção de dados.</span></article>
      </section>

      {sent ? (
        <section className="institutional-success"><span><Icon name="check" size={28} /></span><h2>Interesse registrado</h2><p>A solicitação ficou salva localmente para demonstração. O envio à equipe comercial será conectado ao backend.</p><button className="button button--ghost" type="button" onClick={() => setSent(false)}>Registrar outra instituição</button></section>
      ) : (
        <form className="feature-form institutional-form" onSubmit={submitRequest}>
          <div><p className="eyebrow">Fale com a MamaBloom</p><h2>Solicite uma apresentação</h2></div>
          <label className="field-label">Instituição<input value={form.institution} onChange={(event) => setForm({ ...form, institution: event.target.value })} placeholder="Nome da organização" required /></label>
          <label className="field-label">Seu nome<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label className="field-label">E-mail profissional<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label className="field-label">Perfil da organização<select value={form.profile} onChange={(event) => setForm({ ...form, profile: event.target.value })}><option>Gestão pública</option><option>Empresa</option><option>Instituição de saúde</option><option>Organização social</option></select></label>
          <label className="field-label">Público estimado<input type="number" min="1" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} placeholder="Número de pessoas atendidas" /></label>
          <label className="field-label">Contexto ou objetivo<textarea rows="4" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Conte brevemente sobre o programa" /></label>
          <button className="button button--primary button--wide" type="submit">Registrar interesse</button>
          <small className="institutional-form__note">Demonstração local: este formulário ainda não envia dados pela internet.</small>
        </form>
      )}
    </AppShell>
  )
}
