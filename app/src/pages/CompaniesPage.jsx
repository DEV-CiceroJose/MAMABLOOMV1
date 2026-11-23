import { useState } from 'react'
import FeaturePage, { Feedback } from '../components/FeaturePage.jsx'
import { useCommunity } from '../hooks/useCommunity.js'
import { communityApi } from '../lib/api.js'
import { statusLabel } from '../lib/psychology.js'

export default function CompaniesPage() {
  const { data, error, refresh } = useCommunity('/companies')
  const [form, setForm] = useState({ name: '', cnpj: '', email: '', description: '' })
  const [failure, setFailure] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  async function save(event) {
    event.preventDefault(); setBusy(true); setFailure(''); setStatus('')
    try { await communityApi.post('/companies', { ...form, cnpj: form.cnpj.replace(/\D/g, '') }); setStatus('Empresa enviada para aprovação.'); setForm({ name: '', cnpj: '', email: '', description: '' }); await refresh() }
    catch (err) { setFailure(err.message) } finally { setBusy(false) }
  }
  return <FeaturePage title="Cadastro de empresas" intro="Apresente sua empresa e acompanhe a análise do cadastro."><Feedback error={failure || error} status={status} /><form className="community-card community-form" onSubmit={save}>{[['name', 'Nome da empresa', 'text', 120], ['cnpj', 'CNPJ', 'text', 18], ['email', 'E-mail de contato', 'email', 254]].map(([key, label, type, max]) => <label key={key}>{label}<input type={type} value={form[key]} maxLength={max} required onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<label>Apresentação<textarea value={form.description} maxLength={1000} required onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><button type="submit" disabled={busy} className="button button--primary">Enviar cadastro</button></form><h2>Minhas empresas</h2>{data?.companies.length === 0 && <p>Nenhuma empresa cadastrada.</p>}{data?.companies.map((c) => <article className="community-card" key={c.id}><h3>{c.name}</h3><p>{statusLabel(c.status)}</p>{c.reason && <p>Justificativa: {c.reason}</p>}</article>)}</FeaturePage>
}
