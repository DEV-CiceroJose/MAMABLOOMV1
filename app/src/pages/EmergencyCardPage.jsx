import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { bloodTypes } from '../data/demoData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useLocalData } from '../hooks/useLocalData.js'

export default function EmergencyCardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useLocalData('mamabloom:emergency-card', () => ({
    name: user?.name || 'Maria da Silva', weeks: user?.pregnancy?.weeks || 21, bloodType: 'Não informado', allergies: '', medications: '', contactName: '', contactPhone: '',
  }))
  const [draft, setDraft] = useState(profile)
  const [editing, setEditing] = useState(false)

  function saveCard(event) {
    event.preventDefault()
    setProfile(draft)
    setEditing(false)
  }

  return (
    <AppShell
      className="emergency-prototype"
      header={({ openMenu }) => (
        <header className="emergency-prototype__header">
          <PrototypeToolbar onMenu={openMenu} />
          <h1>Cartão de<br />Emergência</h1>
        </header>
      )}
    >
      {editing ? (
        <form className="feature-form emergency-form emergency-prototype__form" onSubmit={saveCard}>
          <div className="feature-form__heading"><h2>Editar informações</h2><button type="button" className="text-button" onClick={() => setEditing(false)}>Cancelar</button></div>
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
        <>
          <article className="emergency-prototype__identity">
            <div className="emergency-prototype__landscape" aria-hidden="true"><i /><i /></div>
            <div><h2>{profile.name}</h2><p>Gestante<br /><strong>32 anos</strong></p><a href={profile.contactPhone ? `tel:${profile.contactPhone}` : undefined}><Icon name="phone" size={17} /> {profile.contactPhone || '+55 81 98406-2699'}</a><span><Icon name="idCard" size={17} /> ***.***.***-**</span></div>
          </article>

          <section className="emergency-prototype__options" aria-label="Informações de emergência">
            <button type="button" onClick={() => setEditing(true)}><span className="emergency-prototype__option-icon">👣</span><strong>Tempo de<br />gestação</strong><i>›</i><small>{profile.weeks} semanas</small></button>
            <button type="button" onClick={() => setEditing(true)}><span className="emergency-prototype__option-icon">🩸</span><strong>Tipo sanguíneo</strong><i>›</i><small>{profile.bloodType}</small></button>
            <button type="button" onClick={() => setEditing(true)}><span className="emergency-prototype__option-icon">💊</span><strong>Medicamentos<br />em uso</strong><i>›</i><small>{profile.medications || 'Não informado'}</small></button>
            <button type="button" onClick={() => setEditing(true)}><span className="emergency-prototype__option-icon">✋</span><strong>Alergias</strong><i>›</i><small>{profile.allergies || 'Não informado'}</small></button>
            <button className="emergency-prototype__contact" type="button" onClick={() => setEditing(true)}><span><Icon name="users" size={28} /></span><strong>Contatos de emergência</strong><i>›</i></button>
          </section>
          <aside className="local-data-note emergency-prototype__note"><Icon name="lock" size={16} /><span>Dados armazenados somente neste dispositivo.</span></aside>
          <button className="emergency-prototype__print" type="button" onClick={() => window.print()}><Icon name="idCard" size={18} /> Imprimir ou salvar como PDF</button>
        </>
      )}
    </AppShell>
  )
}
