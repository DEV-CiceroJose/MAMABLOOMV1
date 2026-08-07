import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { bloodTypes } from '../data/demoData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useLocalData } from '../hooks/useLocalData.js'

export default function EmergencyCardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useLocalData('mamabloom:emergency-card', () => ({
    name: user?.name || '', weeks: user?.pregnancy?.weeks || 21, bloodType: 'Não informado', allergies: '', medications: '', contactName: '', contactPhone: '',
  }))
  const [draft, setDraft] = useState(profile)
  const [editing, setEditing] = useState(!profile.contactPhone)

  function saveCard(event) {
    event.preventDefault()
    setProfile(draft)
    setEditing(false)
  }

  return (
    <AppShell>
      <PageTitle
        eyebrow="Acesso rápido"
        title="Cartão de emergência"
        action={!editing && <button className="round-action" type="button" onClick={() => setEditing(true)} aria-label="Editar cartão"><Icon name="edit" /></button>}
      />

      <aside className="local-data-note"><Icon name="lock" size={18} /><span>Estes dados ficam somente neste dispositivo nesta versão.</span></aside>

      {editing ? (
        <form className="feature-form emergency-form" onSubmit={saveCard}>
          <label className="field-label">Nome completo<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
          <div className="field-row">
            <label className="field-label">Semanas<input type="number" min="1" max="42" value={draft.weeks} onChange={(event) => setDraft({ ...draft, weeks: event.target.value })} /></label>
            <label className="field-label">Tipo sanguíneo<select value={draft.bloodType} onChange={(event) => setDraft({ ...draft, bloodType: event.target.value })}>{bloodTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          </div>
          <label className="field-label">Alergias<input value={draft.allergies} onChange={(event) => setDraft({ ...draft, allergies: event.target.value })} placeholder="Digite ou informe nenhuma" /></label>
          <label className="field-label">Medicamentos em uso<input value={draft.medications} onChange={(event) => setDraft({ ...draft, medications: event.target.value })} placeholder="Conforme prescrição" /></label>
          <label className="field-label">Contato de confiança<input value={draft.contactName} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} placeholder="Nome do contato" /></label>
          <label className="field-label">Telefone<input type="tel" value={draft.contactPhone} onChange={(event) => setDraft({ ...draft, contactPhone: event.target.value })} placeholder="(00) 00000-0000" required /></label>
          <button className="button button--primary button--wide" type="submit">Salvar cartão</button>
        </form>
      ) : (
        <article className="emergency-card">
          <header><span><Icon name="shield" size={30} /></span><div><small>MAMABLOOM · GESTANTE</small><h2>{profile.name}</h2><p>{profile.weeks} semanas de gestação</p></div></header>
          <div className="emergency-card__grid">
            <div><small>Tipo sanguíneo</small><strong>{profile.bloodType}</strong></div>
            <div><small>Alergias</small><strong>{profile.allergies || 'Não informado'}</strong></div>
            <div><small>Medicamentos</small><strong>{profile.medications || 'Não informado'}</strong></div>
            <div><small>Contato de confiança</small><strong>{profile.contactName || 'Não informado'}</strong><a href={`tel:${profile.contactPhone}`}>{profile.contactPhone}</a></div>
          </div>
        </article>
      )}

      {!editing && <button className="button button--ghost button--wide print-button" type="button" onClick={() => window.print()}><Icon name="idCard" /> Imprimir ou salvar como PDF</button>}
    </AppShell>
  )
}
