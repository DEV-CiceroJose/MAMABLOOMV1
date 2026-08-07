import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useLocalData } from '../hooks/useLocalData.js'

const supportTopics = [
  { id: 'emocional', icon: 'heart', title: 'Acolhimento emocional', text: 'Reconheça seus sentimentos e fortaleça sua rede de apoio.' },
  { id: 'consulta', icon: 'message', title: 'Prepare sua consulta', text: 'Anote dúvidas e mudanças para conversar no pré-natal.' },
  { id: 'rotina', icon: 'calendar', title: 'Rotina com leveza', text: 'Organize prioridades e aceite ajuda nas tarefas possíveis.' },
]

const conversations = [
  { name: 'Andréia Martins', text: 'Ok amiga! Nos falamos depois.', image: 'support-therapy.webp' },
  { name: 'Bianca Correia', text: 'Minha gestação tem sido cheia de descobertas.', image: 'support-mom.webp' },
]

export default function SupportPage() {
  const [favorites, setFavorites] = useLocalData('mamabloom:support-favorites', [])
  const [emergencyCard] = useLocalData('mamabloom:emergency-card', {})
  const [seconds, setSeconds] = useState(60)
  const [breathing, setBreathing] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!breathing) return undefined
    if (seconds === 0) { setBreathing(false); return undefined }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [breathing, seconds])

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function toggleBreathing() {
    if (!breathing && seconds === 0) setSeconds(60)
    setBreathing((current) => !current)
  }

  return (
    <AppShell
      className="support-prototype"
      header={({ openMenu }) => (
        <header className="support-prototype__header">
          <PrototypeToolbar onMenu={openMenu} />
          <h1>Precisando de apoio,<br />mamãe? Estamos aqui<br />para isso!</h1>
        </header>
      )}
    >
      <button className="support-prototype__therapy" type="button" onClick={() => setStatus('O agendamento será conectado aos profissionais na etapa do backend.') }>
        <img src={`${import.meta.env.BASE_URL}prototype/support-therapy.webp`} alt="Ilustração de acolhimento terapêutico" />
        <span><strong>Agende uma sessão<br />de terapia!</strong><small>Aqui, na aba de apoio mamabloom, você encontra profissionais na área da saúde mental para te acompanhar nessa grande fase!</small></span>
      </button>
      {status && <p className="support-prototype__status" role="status">{status}</p>}

      <section className="support-prototype__conversations" aria-labelledby="conversations-title">
        <h2 id="conversations-title">Converse com as outras mamães!</h2>
        {conversations.map((item) => (
          <article key={item.name}><img src={`${import.meta.env.BASE_URL}prototype/${item.image}`} alt="" /><div><strong>{item.name}</strong><p>{item.text}</p></div><span><Icon name="bell" size={23} /><i>1</i></span></article>
        ))}
      </section>

      <section className="support-prototype__suggested" aria-labelledby="suggested-title">
        <h2 id="suggested-title">Perfis sugeridos para você:</h2>
        <div>{['Bianca Correia', 'Andréia Martins', 'Ana Beatriz'].map((name) => <article key={name}><div><Icon name="user" size={36} /><span>+</span></div><strong>{name}</strong></article>)}</div>
      </section>

      <section className="support-prototype__tools" aria-labelledby="support-tools-title">
        <div className="section-heading"><div><p className="eyebrow">Cuidado diário</p><h2 id="support-tools-title">Recursos de acolhimento</h2></div><span>{favorites.length} salvos</span></div>
        <button className="support-prototype__breathing" type="button" onClick={toggleBreathing}><span><Icon name="heart" /></span><div><strong>{breathing ? `${seconds}s · ${seconds % 8 < 4 ? 'Inspire devagar' : 'Expire com calma'}` : 'Um minuto para respirar'}</strong><small>{breathing ? 'Siga no seu ritmo.' : 'Inicie uma pausa consciente.'}</small></div></button>
        <div className="support-list">{supportTopics.map((topic) => <article key={topic.id}><span><Icon name={topic.icon} /></span><div><h3>{topic.title}</h3><p>{topic.text}</p></div><button className={favorites.includes(topic.id) ? 'is-favorite' : ''} type="button" onClick={() => toggleFavorite(topic.id)} aria-label={`${favorites.includes(topic.id) ? 'Remover' : 'Salvar'} ${topic.title}`}><Icon name="heart" size={18} /></button></article>)}</div>
      </section>

      <section className="support-network">
        <div><p className="eyebrow">Sua rede</p><h2>Contato de confiança</h2></div>
        {emergencyCard.contactPhone ? <a href={`tel:${emergencyCard.contactPhone}`}><span><Icon name="phone" /></span><div><strong>{emergencyCard.contactName || 'Contato de confiança'}</strong><small>{emergencyCard.contactPhone}</small></div><Icon name="chevronRight" size={18} /></a> : <Link to="/emergencia">Adicionar contato no cartão de emergência <Icon name="chevronRight" size={18} /></Link>}
      </section>
    </AppShell>
  )
}
