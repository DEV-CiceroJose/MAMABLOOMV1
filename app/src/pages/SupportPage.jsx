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
  { id: 'andreia', name: 'Andréia Martins', text: 'Ok amiga! Nos falamos depois.' },
  { id: 'beca', name: 'Beca Correia', text: 'Minha gestação tem sido cheia de descobertas.' },
]

const suggestedProfiles = [
  { name: 'Beca Correia', image: 'support-mom.webp' },
  { name: 'Andréia Martins', image: 'support-therapy.webp' },
  { name: 'Ana Beatriz', image: 'store-promo.webp' },
]

export default function SupportPage() {
  const [favorites, setFavorites] = useLocalData('mamabloom:support-favorites', [])
  const [emergencyCard] = useLocalData('mamabloom:emergency-card', {})
  const [seconds, setSeconds] = useState(60)
  const [breathing, setBreathing] = useState(false)
  const [status, setStatus] = useState('')
  const [activeConversation, setActiveConversation] = useState(null)
  const [draft, setDraft] = useState('')
  const [chatMessages, setChatMessages] = useState(() => Object.fromEntries(
    conversations.map((conversation) => [conversation.id, [{ id: `${conversation.id}-initial`, sender: 'contact', text: conversation.text }]]),
  ))

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

  function openConversation(conversation) {
    setActiveConversation(conversation)
    setDraft('')
  }

  function sendChatMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !activeConversation) return
    setChatMessages((current) => ({
      ...current,
      [activeConversation.id]: [...current[activeConversation.id], { id: `${Date.now()}-${Math.random()}`, sender: 'user', text }],
    }))
    setDraft('')
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
      <section className={emergencyCard.contactPhone ? 'support-prototype__empty-state has-support' : 'support-prototype__empty-state'} aria-live="polite">
        <span><Icon name="users" size={28} /></span>
        <div>
          <h2>{emergencyCard.contactPhone ? 'Sua rede de apoio' : 'Sem apoio cadastrado'}</h2>
          <p>{emergencyCard.contactPhone ? `${emergencyCard.contactName || 'Contato de confiança'} está disponível no seu cartão de emergência.` : 'Você ainda não adicionou uma pessoa de confiança para acompanhar esta jornada.'}</p>
        </div>
        <Link to="/emergencia">{emergencyCard.contactPhone ? 'Ver contato' : 'Adicionar apoio'}</Link>
      </section>

      <button className="support-prototype__therapy" type="button" onClick={() => setStatus('O agendamento será conectado aos profissionais na etapa do backend.') }>
        <span className="support-prototype__therapy-icon"><Icon name="psychology" size={62} /></span>
        <span><strong>Agende uma sessão<br />de terapia!</strong><small>Aqui, na aba de apoio mamabloom, você encontra profissionais na área da saúde mental para te acompanhar nessa grande fase!</small></span>
      </button>
      {status && <p className="support-prototype__status" role="status">{status}</p>}

      {activeConversation ? (
        <section className="support-prototype__chat" aria-labelledby="active-chat-title">
          <header>
            <button type="button" onClick={() => setActiveConversation(null)} aria-label="Voltar para conversas"><Icon name="arrowLeft" size={19} /></button>
            <span>{activeConversation.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>
            <div><h2 id="active-chat-title">{activeConversation.name}</h2><small>Conversa de apoio</small></div>
          </header>
          <div className="support-prototype__chat-messages" aria-live="polite">
            {chatMessages[activeConversation.id].map((item) => <p className={item.sender === 'user' ? 'is-user' : ''} key={item.id}>{item.text}</p>)}
          </div>
          <form onSubmit={sendChatMessage}>
            <label className="sr-only" htmlFor="support-chat-message">Mensagem para {activeConversation.name}</label>
            <input id="support-chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Digite uma mensagem" />
            <button type="submit" aria-label="Enviar mensagem"><Icon name="send" size={18} /></button>
          </form>
        </section>
      ) : (
        <section className="support-prototype__conversations" aria-labelledby="conversations-title">
          <h2 id="conversations-title">Converse com as outras mamães!</h2>
          {conversations.map((item) => (
            <button type="button" key={item.id} onClick={() => openConversation(item)} aria-label={`Abrir conversa com ${item.name}`}>
              <span className="support-prototype__conversation-avatar">{item.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>
              <div><strong>{item.name}</strong><p>{item.text}</p></div>
              <span className="support-prototype__conversation-alert"><Icon name="message" size={23} /><i>1</i></span>
            </button>
          ))}
        </section>
      )}

      <section className="support-prototype__suggested" aria-labelledby="suggested-title">
        <h2 id="suggested-title">Perfis sugeridos para você:</h2>
        <div>{suggestedProfiles.map((profile) => <article key={profile.name}><div><img src={`${import.meta.env.BASE_URL}prototype/${profile.image}`} alt={`Perfil de ${profile.name}`} /><span>+</span></div><strong>{profile.name}</strong></article>)}</div>
      </section>

      <section className="support-prototype__tools" aria-labelledby="support-tools-title">
        <div className="section-heading"><div><p className="eyebrow">Cuidado diário</p><h2 id="support-tools-title">Recursos de acolhimento</h2></div><span>{favorites.length} salvos</span></div>
        <button className="support-prototype__breathing" type="button" onClick={toggleBreathing}><span><Icon name="heart" /></span><div><strong>{breathing ? `${seconds}s · ${seconds % 8 < 4 ? 'Inspire devagar' : 'Expire com calma'}` : 'Um minuto para respirar'}</strong><small>{breathing ? 'Siga no seu ritmo.' : 'Inicie uma pausa consciente.'}</small></div></button>
        <div className="support-list">{supportTopics.map((topic) => <article key={topic.id}><span><Icon name={topic.icon} /></span><div><h3>{topic.title}</h3><p>{topic.text}</p></div><button className={favorites.includes(topic.id) ? 'is-favorite' : ''} type="button" onClick={() => toggleFavorite(topic.id)} aria-label={`${favorites.includes(topic.id) ? 'Remover' : 'Salvar'} ${topic.title}`}><Icon name="heart" size={18} /></button></article>)}</div>
      </section>

      <section className="support-network">
        <div><p className="eyebrow">Sua rede</p><h2>Contato de confiança</h2></div>
        {emergencyCard.contactPhone ? <a href={`tel:${emergencyCard.contactPhone}`}><span><Icon name="phone" /></span><div><strong>{emergencyCard.contactName || 'Contato de confiança'}</strong><small>{emergencyCard.contactPhone}</small></div><Icon name="chevronRight" size={18} /></a> : <Link to="/emergencia"><span><Icon name="users" /></span><div><strong>Adicionar apoio</strong><small>Cadastre uma pessoa de confiança</small></div><Icon name="chevronRight" size={18} /></Link>}
      </section>
    </AppShell>
  )
}
