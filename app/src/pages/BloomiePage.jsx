import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useLocalData } from '../hooks/useLocalData.js'
import { createBloomieReply } from '../lib/bloomie.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
const initialMessages = [{ id: 'welcome', sender: 'bloomie', text: 'Oi! Eu sou a Bloomie. Este é um espaço de acolhimento para você organizar sentimentos e pequenas dúvidas da jornada.', tone: 'general' }]
const suggestions = ['Estou ansiosa', 'Quero descansar melhor', 'Organizar minha semana']

export default function BloomiePage() {
  const [messages, setMessages] = useLocalData('mamabloom:bloomie-chat', initialMessages)
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

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
    setShowSuggestions(false)
  }

  return (
    <AppShell
      className="bloomie-prototype"
      navTone="yellow"
      header={({ openMenu }) => (
        <section className="bloomie-prototype__panel" aria-label="Conversa com a Bloomie">
          <PrototypeToolbar onMenu={openMenu} />

          <div className="bloomie-prototype__intro">
            <div className="bloomie-prototype__speech">OLÁ, EU SOU A<br />BLOOMIE!</div>
            <img src={`${import.meta.env.BASE_URL}brand/bee-flower.webp`} alt="Bloomie, assistente virtual do MamaBloom" />
            <p>Tire suas dúvidas sobre<br />a maternidade aqui<br />comigo!</p>
          </div>

          {messages.length > 1 && (
            <div className="bloomie-prototype__messages" aria-live="polite">
              {messages.slice(1).map((message) => (
                <p className={`bloomie-prototype__message bloomie-prototype__message--${message.sender}${message.tone === 'urgent' ? ' is-urgent' : ''}`} key={message.id}>{message.text}</p>
              ))}
            </div>
          )}

          {showSuggestions && (
            <div className="bloomie-prototype__suggestions" aria-label="Sugestões de conversa">
              {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => sendMessage(null, suggestion)}>{suggestion}</button>)}
            </div>
          )}

          <form className="bloomie-prototype__composer" onSubmit={sendMessage}>
            <button type="button" onClick={() => setShowSuggestions((current) => !current)} aria-label="Mostrar sugestões"><Icon name="plus" size={25} /></button>
            <label className="sr-only" htmlFor="bloomie-message">Mensagem para a Bloomie</label>
            <input id="bloomie-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte" />
            <button type="submit" aria-label="Enviar mensagem"><Icon name="mic" size={24} /></button>
          </form>
        </section>
      )}
    >
      <aside className="bloomie-prototype__notice"><Icon name="shield" size={17} /><p>A Bloomie oferece apoio educativo e emocional e não substitui profissionais de saúde.</p></aside>
    </AppShell>
  )
}
