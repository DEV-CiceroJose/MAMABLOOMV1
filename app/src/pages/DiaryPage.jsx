import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { moods } from '../data/demoData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, toDateKey } from '../lib/date.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function DiaryPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useLocalData('mamabloom:diary', [])
  const [reminder, setReminder] = useLocalData('mamabloom:diary-reminder', false)
  const [mood, setMood] = useState('')
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const firstName = (user?.name || 'Maria').trim().split(/\s+/)[0]

  function saveEntry(event) {
    event.preventDefault()
    if (!mood) {
      setMessage('Escolha como você está se sentindo.')
      return
    }
    const entry = { id: createId(), mood, text: text.trim(), date: toDateKey(), createdAt: new Date().toISOString() }
    setEntries((current) => [entry, ...current])
    setMood('')
    setText('')
    setMessage('Registro salvo no seu dispositivo.')
    setShowComposer(false)
  }

  return (
    <AppShell
      className="diary-prototype"
      navTone="yellow"
      header={({ openMenu }) => (
        <header className="diary-prototype__header">
          <PrototypeToolbar onMenu={openMenu} />
          <div>
            <h1>Bom dia,<br />{firstName} <span aria-hidden="true">🌸</span></h1>
            <img src={`${import.meta.env.BASE_URL}brand/bee-baby.webp`} alt="" />
          </div>
          <p>Como você está se sentindo hoje?</p>
        </header>
      )}
    >
      <section className="diary-prototype__mood" aria-labelledby="mood-title">
        <h2 id="mood-title"><span aria-hidden="true">😊</span> Mood do dia</h2>
        <p>Como você se sente?</p>
        <div className="mood-picker" role="group" aria-label="Escolha seu humor">
          {moods.map((item) => (
            <button className={mood === item.id ? 'mood-option mood-option--selected' : 'mood-option'} type="button" key={item.id} onClick={() => { setMood(item.id); setMessage('') }} aria-pressed={mood === item.id}>
              <span>{item.emoji}</span><small>{item.label}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="diary-prototype__today" aria-labelledby="diary-today-title">
        <header><h2 id="diary-today-title"><Icon name="calendar" size={22} /> Diário do dia</h2><time>{formatLongDate(toDateKey())}</time></header>
        {showComposer ? (
          <form onSubmit={saveEntry}>
            <label htmlFor="diary-text">Querido diário,</label>
            <textarea id="diary-text" rows="6" value={text} onChange={(event) => setText(event.target.value)} placeholder="Este é um espaço só seu..." />
            {message && <p className="form-message" role="status">{message}</p>}
            <button className="button button--primary button--wide" type="submit">Salvar no diário</button>
          </form>
        ) : (
          <>
            <div className="diary-prototype__preview">
              <div><strong>Querido diário,</strong><p>{entries[0]?.text || 'Hoje é um novo dia para acolher meus sentimentos, registrar memórias e florescer no meu próprio ritmo.'}</p></div>
              <img src={`${import.meta.env.BASE_URL}prototype/support-mom.webp`} alt="Gestante registrando um momento da sua jornada" />
            </div>
            <button className="diary-prototype__write" type="button" onClick={() => setShowComposer(true)}><Icon name="edit" size={19} /> Escrever um novo</button>
          </>
        )}
      </section>

      <label className="diary-prototype__reminder">
        <span><Icon name="bell" size={20} /><span><strong>Me lembre</strong><small>Dia de reflexão<br />Todo dia, às 9:00 PM</small></span></span>
        <input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} />
      </label>

      {entries.length > 1 && (
        <section className="diary-prototype__history" aria-labelledby="diary-history-title">
          <h2 id="diary-history-title">Registros recentes</h2>
          {entries.slice(1).map((entry) => <article key={entry.id}><p>{entry.text || 'Um momento registrado sem anotações.'}</p><button type="button" onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))} aria-label="Excluir registro"><Icon name="trash" size={16} /></button></article>)}
        </section>
      )}
    </AppShell>
  )
}
