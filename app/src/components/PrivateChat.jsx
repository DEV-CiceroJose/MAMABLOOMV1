import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { communityApi } from '../lib/api.js'
import { Feedback } from './FeaturePage.jsx'

const dateLabel = (value) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

export default function PrivateChat({ path, name, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(null)
  const panel = useRef(null)
  useEffect(() => { panel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }) }, [])
  useEffect(() => {
    let active = true
    async function read() {
      try { const data = await communityApi.get(path); if (active) setMessages(data.messages) }
      catch (err) { if (active) setError(err.message) }
    }
    void read(); const timer = setInterval(read, 5000)
    return () => { active = false; clearInterval(timer) }
  }, [path])
  async function send(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    if (pending.current?.text !== text) pending.current = { text, clientId: crypto.randomUUID() }
    setBusy(true); setError('')
    try {
      await communityApi.post(path, pending.current)
      pending.current = null; setDraft('')
      const data = await communityApi.get(path); setMessages(data.messages)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <section ref={panel} className="community-card consultation-chat" aria-label={`Conversa com ${name}`}><header><div><h2>Conversa com {name}</h2><small>Mensagens privadas</small></div><button className="text-button" type="button" onClick={onClose}>Fechar</button></header><div className="consultation-chat__messages" aria-live="polite">{messages.length === 0 && <p>Comece uma conversa.</p>}{messages.map((m) => <div className={m.senderId === user.id ? 'is-own' : ''} key={m.id}><strong>{m.senderId === user.id ? 'Você' : name}</strong><p>{m.text}</p><small>{dateLabel(m.createdAt)}</small></div>)}</div><form className="community-form" onSubmit={send}><label>Mensagem<textarea value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} required /></label><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar mensagem'}</button></form><Feedback error={error} /></section>
}
