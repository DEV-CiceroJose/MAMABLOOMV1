import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { moods } from '../data/demoData.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, toDateKey } from '../lib/date.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function DiaryPage() {
  const [entries, setEntries] = useLocalData('mamabloom:diary', [])
  const [reminder, setReminder] = useLocalData('mamabloom:diary-reminder', false)
  const [mood, setMood] = useState('')
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')

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
  }

  return (
    <AppShell>
      <PageTitle eyebrow="Seu espaço" title="Diário gestacional" />

      <form className="diary-composer" onSubmit={saveEntry}>
        <div><p className="eyebrow">Check-in de hoje</p><h2>Como você está?</h2></div>
        <div className="mood-picker" role="group" aria-label="Escolha seu humor">
          {moods.map((item) => (
            <button className={mood === item.id ? 'mood-option mood-option--selected' : 'mood-option'} type="button" key={item.id} onClick={() => { setMood(item.id); setMessage('') }} aria-pressed={mood === item.id}>
              <span>{item.emoji}</span><small>{item.label}</small>
            </button>
          ))}
        </div>
        <label className="field-label" htmlFor="diary-text">Escreva uma memória ou sentimento <span>(opcional)</span></label>
        <textarea id="diary-text" rows="5" value={text} onChange={(event) => setText(event.target.value)} placeholder="Este é um espaço só seu..." />
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="button button--primary button--wide" type="submit">Salvar no diário</button>
      </form>

      <label className="reminder-card">
        <span><Icon name="clock" /><span><strong>Lembrete diário</strong><small>Reserve um momento para você</small></span></span>
        <input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} />
      </label>

      <section className="feature-section" aria-labelledby="diary-history-title">
        <div className="section-heading"><div><p className="eyebrow">Memórias</p><h2 id="diary-history-title">Registros recentes</h2></div><span>{entries.length} {entries.length === 1 ? 'registro' : 'registros'}</span></div>
        <div className="diary-list">
          {entries.length ? entries.map((entry) => {
            const entryMood = moods.find((item) => item.id === entry.mood)
            return (
              <article className="diary-entry" key={entry.id}>
                <span className="diary-entry__mood">{entryMood?.emoji}</span>
                <div><small>{formatLongDate(entry.date)} · {entryMood?.label}</small><p>{entry.text || 'Um momento registrado sem anotações.'}</p></div>
                <button type="button" onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))} aria-label="Excluir registro"><Icon name="trash" size={17} /></button>
              </article>
            )
          }) : <div className="empty-state"><span className="empty-state__emoji">🌼</span><p>Seu primeiro registro pode começar hoje.</p></div>}
        </div>
      </section>
    </AppShell>
  )
}
