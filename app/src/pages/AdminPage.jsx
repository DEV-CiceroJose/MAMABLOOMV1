import { useState } from 'react'
import FeaturePage, { Feedback } from '../components/FeaturePage.jsx'
import { useCommunity } from '../hooks/useCommunity.js'
import { communityApi } from '../lib/api.js'
import { statusLabel } from '../lib/psychology.js'

export default function AdminPage() {
  const { data, error, refresh } = useCommunity('/admin')
  const [tab, setTab] = useState('professionals')
  return <FeaturePage title="Administração" intro="Analise os cadastros de empresas e profissionais."><Feedback error={error} />
    {data && <><div className="community-actions" aria-label="Tipo de cadastro"><button className="button button--outline" type="button" aria-pressed={tab === 'professionals'} onClick={() => setTab('professionals')}>Psicólogos</button><button className="button button--outline" type="button" aria-pressed={tab === 'companies'} onClick={() => setTab('companies')}>Empresas</button></div>
      {data[tab].length === 0 && <p>Nenhum cadastro recebido.</p>}{[...data[tab]].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending')).map((item) => <article className="community-card" key={item.id || item.userId}><p className="eyebrow">{statusLabel(item.status)}</p><h2>{item.name}</h2>{tab === 'professionals' ? <><p>{item.registration} · {item.specialties}</p><dl><dt>Formação</dt><dd>{item.education}</dd><dt>Experiência</dt><dd>{item.experience}</dd></dl><p>{item.bio}</p></> : <><p>CNPJ: {item.cnpj}</p><p>{item.email}</p><p>{item.description}</p></>}{item.reason && <p>Justificativa: {item.reason}</p>}{item.reviewedAt && <small>Analisado em {new Date(item.reviewedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</small>}{item.status === 'pending' && <ReviewForm kind={tab} item={item} onSaved={refresh} />}</article>)}
    </>}
  </FeaturePage>
}

function ReviewForm({ kind, item, onSaved }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function review(status) {
    setBusy(true); setError('')
    try { await communityApi.put(`/admin/${kind}/${item.id || item.userId}`, { status, reason }); await onSaved() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="community-form"><label>Observação ou justificativa<textarea value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} /></label><div className="community-actions"><button className="button button--primary" disabled={busy} type="button" onClick={() => review('approved')}>Aprovar cadastro</button><button className="button button--outline" disabled={busy} type="button" onClick={() => review('rejected')}>Rejeitar cadastro</button></div><Feedback error={error} /></div>
}
