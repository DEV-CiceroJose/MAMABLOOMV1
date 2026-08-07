import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { useLocalData } from '../hooks/useLocalData.js'

const supportTopics = [
  { id: 'emocional', icon: 'heart', title: 'Acolhimento emocional', text: 'Reconheça seus sentimentos e fortaleça sua rede de apoio.' },
  { id: 'consulta', icon: 'message', title: 'Prepare sua consulta', text: 'Anote dúvidas, sintomas e mudanças para conversar no pré-natal.' },
  { id: 'rotina', icon: 'calendar', title: 'Rotina com leveza', text: 'Organize prioridades e aceite ajuda nas tarefas possíveis.' },
]

export default function SupportPage() {
  const [favorites, setFavorites] = useLocalData('mamabloom:support-favorites', [])
  const [emergencyCard] = useLocalData('mamabloom:emergency-card', {})
  const [seconds, setSeconds] = useState(60)
  const [breathing, setBreathing] = useState(false)

  useEffect(() => {
    if (!breathing) return undefined
    if (seconds === 0) {
      setBreathing(false)
      return undefined
    }
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
    <AppShell>
      <PageTitle eyebrow="Cuidado diário" title="Central de apoio" />

      <section className="breathing-card">
        <div><p className="eyebrow eyebrow--light">Pausa consciente</p><h2>Um minuto para respirar</h2><p>{breathing ? (seconds % 8 < 4 ? 'Inspire devagar...' : 'Expire com calma...') : 'Encontre uma posição confortável e respire no seu ritmo.'}</p></div>
        <button className={breathing ? 'breathing-orb is-active' : 'breathing-orb'} type="button" onClick={toggleBreathing} aria-label={breathing ? 'Pausar exercício' : 'Iniciar exercício'}><strong>{breathing ? seconds : 'Iniciar'}</strong></button>
      </section>

      <section aria-labelledby="support-topics-title">
        <div className="section-heading"><div><p className="eyebrow">Conteúdos de apoio</p><h2 id="support-topics-title">Para este momento</h2></div><span>{favorites.length} salvos</span></div>
        <div className="support-list">
          {supportTopics.map((topic) => (
            <article key={topic.id}><span><Icon name={topic.icon} /></span><div><h3>{topic.title}</h3><p>{topic.text}</p></div><button className={favorites.includes(topic.id) ? 'is-favorite' : ''} type="button" onClick={() => toggleFavorite(topic.id)} aria-label={`${favorites.includes(topic.id) ? 'Remover' : 'Salvar'} ${topic.title}`}><Icon name="heart" size={18} /></button></article>
          ))}
        </div>
      </section>

      <section className="support-network">
        <div><p className="eyebrow">Sua rede</p><h2>Contato de confiança</h2></div>
        {emergencyCard.contactPhone ? <a href={`tel:${emergencyCard.contactPhone}`}><span><Icon name="phone" /></span><div><strong>{emergencyCard.contactName || 'Contato de confiança'}</strong><small>{emergencyCard.contactPhone}</small></div><Icon name="chevronRight" size={18} /></a> : <Link to="/emergencia">Adicionar contato no cartão de emergência <Icon name="chevronRight" size={18} /></Link>}
      </section>

      <aside className="urgent-support"><Icon name="alert" /><div><strong>Precisa de ajuda imediata?</strong><p>Em uma situação de emergência, procure o serviço de urgência da sua região. A MamaBloom não substitui atendimento profissional.</p></div></aside>
    </AppShell>
  )
}
