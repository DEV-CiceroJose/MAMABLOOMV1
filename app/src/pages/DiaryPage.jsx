import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { moods } from '../data/demoData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, toDateKey } from '../lib/date.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function DiaryPage() {
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const [entries, setEntries] = useLocalData('mamabloom:diary', [])
  const [reminder, setReminder] = useLocalData('mamabloom:diary-reminder', false)
  const [mood, setMood] = useState('')
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [message, setMessage] = useState('')
  const [showComposer, setShowComposer] = useState(params.get('escrever') === '1')
  const attachmentInputRef = useRef(null)
  const firstName = (user?.name || 'Maria').trim().split(/\s+/)[0]

  function saveEntry(event) {
    event.preventDefault()
    if (!mood) {
      setMessage('Escolha como você está se sentindo.')
      return
    }
    const entry = {
      id: createId(),
      mood,
      text: text.trim(),
      image: attachment?.dataUrl ?? null,
      imageName: attachment?.name ?? null,
      date: toDateKey(),
      createdAt: new Date().toISOString(),
    }
    setEntries((current) => [entry, ...current])
    setMood('')
    setText('')
    setAttachment(null)
    if (attachmentInputRef.current) attachmentInputRef.current.value = ''
    setMessage('Registro salvo no seu dispositivo.')
    setShowComposer(false)
    setParams({}, { replace: true })
  }

  function selectAttachment(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Escolha uma imagem JPG, PNG ou WebP.')
      event.target.value = ''
      return
    }
    if (file.size > 700 * 1024) {
      setMessage('A imagem deve ter no máximo 700 KB para ser sincronizada com segurança.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAttachment({ name: file.name, dataUrl: reader.result })
      setMessage('Imagem pronta para ser anexada ao registro.')
    }
    reader.onerror = () => setMessage('Não foi possível ler a imagem selecionada.')
    reader.readAsDataURL(file)
  }

  function removeAttachment() {
    setAttachment(null)
    if (attachmentInputRef.current) attachmentInputRef.current.value = ''
    setMessage('Imagem removida do registro.')
  }

  function deleteEntry(entryId) {
    setEntries((current) => current.filter((item) => item.id !== entryId))
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
            <Link className="diary-prototype__support-link" to="/apoio" aria-label="Ir para a Central de apoio"><img src={`${import.meta.env.BASE_URL}brand/bee-baby.webp`} alt="" /></Link>
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
            <div className="diary-prototype__attachment">
              <input ref={attachmentInputRef} id="diary-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectAttachment} />
              <label htmlFor="diary-image"><Icon name="image" size={18} /> {attachment ? 'Trocar imagem' : 'Anexar imagem'}</label>
              {attachment && (
                <div className="diary-prototype__attachment-preview">
                  <img src={attachment.dataUrl} alt="Prévia da imagem selecionada" />
                  <span>{attachment.name}</span>
                  <button type="button" onClick={removeAttachment} aria-label="Remover imagem"><Icon name="trash" size={15} /></button>
                </div>
              )}
            </div>
            {message && <p className="form-message" role="status">{message}</p>}
            <button className="button button--primary button--wide" type="submit">Salvar no diário</button>
          </form>
        ) : (
          <>
            <div className="diary-prototype__preview">
              <div className="diary-prototype__preview-copy">
                <strong>Querido diário,</strong>
                <p>{entries[0]?.text || 'Este é um espaço só seu...'}</p>
                {entries[0] && <button type="button" onClick={() => deleteEntry(entries[0].id)} aria-label="Excluir registro mais recente"><Icon name="trash" size={16} /></button>}
              </div>
              <Link className="diary-prototype__open-book" to="/diario/memorias" aria-label="Abrir meu diário"><img className="diary-prototype__illustration" src={`${import.meta.env.BASE_URL}prototype/home-diary.webp`} alt="" /><span>Abrir meu diário</span></Link>
            </div>
            <button className="diary-prototype__write" type="button" onClick={() => setShowComposer(true)}><Icon name="edit" size={19} /> Escrever um novo</button>
          </>
        )}
      </section>

      {message && !showComposer && <p className="form-message" role="status">{message}</p>}

      <label className="diary-prototype__reminder">
        <span><Icon name="bell" size={20} /><span><strong>Me lembre</strong><small>Dia de reflexão<br />Todo dia, às 9:00 PM</small></span></span>
        <input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} />
      </label>

      {entries.length > 0 && (
        <section className="diary-prototype__history" aria-labelledby="diary-history-title">
          <h2 id="diary-history-title">Suas memórias</h2>
          <p>Relembre os momentos que você guardou.</p>
          {entries.map((entry) => <article key={entry.id}><Link to={`/diario/memorias?registro=${encodeURIComponent(entry.id)}`} aria-label={`Relembrar registro de ${formatLongDate(entry.date)}`}>
            {entry.image ? <img src={entry.image} alt="Foto da memória" /> : <span className="diary-prototype__memory-icon"><Icon name="book" /></span>}
            <div><time dateTime={entry.date}>{formatLongDate(entry.date)}</time><p>{entry.text || 'Um momento registrado sem anotações.'}</p></div>
          </Link><button type="button" onClick={() => deleteEntry(entry.id)} aria-label="Excluir registro"><Icon name="trash" size={16} /></button></article>)}
        </section>
      )}
    </AppShell>
  )
}
