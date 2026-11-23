import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import IllustratedActionCard from '../components/prototype/IllustratedActionCard.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { dailyArticle } from '../data/articles.js'

const extraLinks = [
  { to: '/saude', icon: 'activity', label: 'Saúde da mamãe' },
  { to: '/emergencia', icon: 'shield', label: 'Cartão de emergência' },
  { to: '/relatorios', icon: 'chart', label: 'Relatório gestacional' },
  { to: '/apoio', icon: 'heart', label: 'Central de apoio' },
  { to: '/loja', icon: 'bag', label: 'Loja MamaBloom' },
  { to: '/planos', icon: 'sparkles', label: 'Planos MamaBloom+' },
]

export default function HomePreviewPage() {
  const { user, updateProfile } = useAuth()
  const [editingBaby, setEditingBaby] = useState(false)
  const [babyDraft, setBabyDraft] = useState(user?.pregnancy?.babyName || '')
  const [babyStatus, setBabyStatus] = useState('')
  const [babyError, setBabyError] = useState('')
  const [savingBaby, setSavingBaby] = useState(false)
  const reading = dailyArticle()
  async function saveBaby(event) {
    event.preventDefault(); setSavingBaby(true); setBabyError('')
    try {
      await updateProfile({ name: user.name, email: user.email, birthDate: user.birthDate, babyName: babyDraft.trim() })
      setEditingBaby(false); setBabyStatus('Nome do bebê atualizado.')
    } catch (error) { setBabyError(error.message) } finally { setSavingBaby(false) }
  }
  const weeks = user?.pregnancy?.weeks ?? 21
  const month = Math.min(9, Math.max(1, Math.ceil(weeks / 4)))
  const babyName = user?.pregnancy?.babyName?.trim() || 'Meu bebê'
  const prototypeAsset = (name) => `${import.meta.env.BASE_URL}prototype/${name}`

  return (
    <AppShell
      className="home-prototype"
      header={({ openMenu }) => (
        <section className="home-prototype__hero" aria-labelledby="home-greeting">
          <PrototypeToolbar className="home-prototype__toolbar" search onMenu={openMenu} />
          <div className="home-prototype__journey">
            <div>
              <h1 id="home-greeting">{babyName.toLocaleUpperCase('pt-BR')}</h1>
              <p className="home-prototype__weeks"><strong>{weeks} Semanas</strong><span>{month}º mês de gestação</span></p>
            </div>
            <figure className="home-prototype__baby">
              <span className="home-prototype__baby-art"><img src={prototypeAsset('pregnancy-improved.png')} alt={`Ilustração do desenvolvimento de ${babyName}`} /></span>
              <figcaption><button className="baby-name-button" type="button" aria-label="Editar nome do bebê" onClick={() => { setBabyDraft(user?.pregnancy?.babyName || ''); setEditingBaby(true); setBabyStatus(''); setBabyError('') }}>{babyName} <Icon name="edit" size={14} /></button></figcaption>
            </figure>
          </div>
        </section>
      )}
    >
      {editingBaby && <form className="community-card community-form" onSubmit={saveBaby}><label>Nome do bebê<input autoFocus maxLength={80} value={babyDraft} onChange={(event) => setBabyDraft(event.target.value)} placeholder="Meu bebê" /></label><div className="community-actions"><button className="button button--primary" type="submit" disabled={savingBaby}>Salvar nome</button><button className="button button--outline" type="button" disabled={savingBaby} onClick={() => setEditingBaby(false)}>Cancelar</button></div>{babyError && <p role="alert" className="field-error">{babyError}</p>}</form>}
      {babyStatus && <p className="community-status" role="status">{babyStatus}</p>}
      <section className="home-prototype__content" aria-labelledby="home-access-title">
        <h2 id="home-access-title">Acesse:</h2>
        <div className="home-prototype__actions">
          <IllustratedActionCard image={prototypeAsset('home-agenda.webp')} label="Agenda" to="/agenda" />
          <IllustratedActionCard image={prototypeAsset('home-diary.webp')} label="Diário" to="/diario" />
        </div>

        <h2>Faça a leitura do dia!</h2>
        <Link to={`/artigos/${reading.id}`} className="home-prototype__reading">
          <img src={prototypeAsset('home-reading.webp')} alt="Leitura para a jornada materna" />
          <div>
            <strong>{reading.title}</strong>
            <span>{reading.category}</span>
          </div>
        </Link>

        <section className="home-prototype__more" aria-labelledby="home-more-title">
          <h2 id="home-more-title">Continue explorando</h2>
          <div>
            {extraLinks.map((item) => (
              <Link to={item.to} key={item.to}>
                <span><Icon name={item.icon} size={21} /></span>
                <strong>{item.label}</strong>
                <Icon name="chevronRight" size={17} />
              </Link>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  )
}
