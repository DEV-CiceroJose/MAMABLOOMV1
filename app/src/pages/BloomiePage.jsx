import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { useLocalData } from '../hooks/useLocalData.js'
import { createBloomieReply } from '../lib/bloomie.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
const initialMessages = [{ id: 'welcome', sender: 'bloomie', text: 'Oi! Eu sou a Bloomie. Este é um espaço de acolhimento para você organizar sentimentos e pequenas dúvidas da jornada.', tone: 'general' }]
const suggestions = ['Estou ansiosa', 'Quero descansar melhor', 'Organizar minha semana']

export default function BloomiePage() {
  const [messages, setMessages] = useLocalData('mamabloom:bloomie-chat', initialMessages)
  const [input, setInput] = useState('')

  function sendMessage(event, suggestion) {
    event?.preventDefault()
    const content = (suggestion ?? input).trim()
    if (!content) return
    const reply = createBloomieReply(content)
    setMessages((current) => [
      ...current,
      { id: createId(), sender: 'user', text: content },
      { id: createId(), sender: 'bloomie', text: reply.text, tone: reply.tone },
    ])
    setInput('')
  }

  return (
    <AppShell>
      <PageTitle eyebrow="Acolhimento" title="Converse com a Bloomie" />
      <aside className="bloomie-notice"><Icon name="shield" /><p>A Bloomie oferece apoio educativo e emocional. Ela não realiza diagnóstico nem substitui profissionais de saúde.</p></aside>

      <section className="chat-card" aria-label="Conversa com a Bloomie">
        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`chat-message chat-message--${message.sender}${message.tone === 'urgent' ? ' chat-message--urgent' : ''}`} key={message.id}>
              {message.sender === 'bloomie' && <span className="chat-avatar"><img src={`${import.meta.env.BASE_URL}brand/bee-baby.webp`} alt="" /></span>}
              <p>{message.text}</p>
            </article>
          ))}
        </div>

        <div className="chat-suggestions" aria-label="Sugestões de conversa">
          {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => sendMessage(null, suggestion)}>{suggestion}</button>)}
        </div>

        <form className="chat-composer" onSubmit={sendMessage}>
          <label className="sr-only" htmlFor="bloomie-message">Mensagem para a Bloomie</label>
          <textarea id="bloomie-message" rows="2" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Conte como você está..." />
          <button type="submit" aria-label="Enviar mensagem"><Icon name="send" /></button>
        </form>
      </section>
    </AppShell>
  )
}
