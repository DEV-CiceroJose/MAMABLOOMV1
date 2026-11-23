import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useLocalData } from '../hooks/useLocalData.js'
import { moods } from '../data/demoData.js'
import { formatLongDate } from '../lib/date.js'
import '../styles/diary-reader.css'

export default function DiaryReaderPage() {
  const [entries] = useLocalData('mamabloom:diary', [])
  const [params, setParams] = useSearchParams()
  const headingRef = useRef(null)
  const headerRef = useRef(null)
  const bookRef = useRef(null)
  const pages = [...entries].sort((a, b) => (a.createdAt || a.date || '').localeCompare(b.createdAt || b.date || ''))
  const requestedIndex = pages.findIndex((entry) => entry.id === params.get('registro'))
  const pageIndex = requestedIndex < 0 ? pages.length - 1 : requestedIndex
  const entry = pages[pageIndex]
  const mood = moods.find((item) => item.id === entry?.mood)

  useEffect(() => {
    headingRef.current?.focus()
    headerRef.current?.scrollIntoView?.({ block: 'start' })
  }, [])

  function turnPage(index) {
    if (!pages[index]) return
    setParams({ registro: pages[index].id }, { replace: true })
    bookRef.current?.focus()
    bookRef.current?.scrollIntoView?.({ block: 'start' })
  }

  return <AppShell className="diary-reader" navTone="yellow" header={({ openMenu }) => (
    <header className="diary-reader__header" ref={headerRef}>
      <Link to="/diario" aria-label="Voltar ao diário do dia"><Icon name="arrowLeft" /></Link>
      <h1 ref={headingRef} tabIndex={-1}>Meu diário</h1>
      <PrototypeToolbar onMenu={openMenu} />
    </header>
  )}>
    {entry ? <>
      <label className="diary-reader__index">Relembrar um registro
        <select value={entry.id} onChange={(event) => turnPage(pages.findIndex((page) => page.id === event.target.value))}>
          {pages.map((page, index) => <option key={page.id} value={page.id}>{formatLongDate(page.date)} · Página {index + 1}</option>)}
        </select>
      </label>
      <article className="diary-book" aria-label="Registro do diário" ref={bookRef} tabIndex={-1}>
        <div className="diary-book__photo-page">
          <p className="diary-book__caption">Um pedacinho da nossa história</p>
          {entry.image ? <figure><img src={entry.image} alt="Foto deste registro" /></figure> : <div className="diary-book__keepsake"><Icon name="heart" size={54} /><p>Memórias que florescem.</p></div>}
          <span className="diary-book__flower" aria-hidden="true">❀</span>
        </div>
        <div className="diary-book__writing-page">
          <time dateTime={entry.date}>{formatLongDate(entry.date)}</time>
          {mood && <span className="diary-book__mood">{mood.emoji} {mood.label}</span>}
          <h2>Querido diário,</h2>
          <p className="diary-book__text">{entry.text || 'Um momento registrado sem anotações.'}</p>
          <span className="diary-book__page-number">{pageIndex + 1}</span>
        </div>
      </article>
      <nav className="diary-reader__pagination" aria-label="Páginas do diário">
        <button type="button" aria-label="Página anterior" disabled={pageIndex <= 0} onClick={() => turnPage(pageIndex - 1)}><Icon name="arrowLeft" /><span>Anterior</span></button>
        <p aria-live="polite">Página {pageIndex + 1} de {pages.length}</p>
        <button type="button" aria-label="Próxima página" disabled={pageIndex >= pages.length - 1} onClick={() => turnPage(pageIndex + 1)}><span>Próxima</span><Icon name="arrowRight" /></button>
      </nav>
      <Link className="diary-reader__new" to="/diario?escrever=1"><Icon name="edit" size={18} /> Escrever uma nova memória</Link>
    </> : <section className="diary-reader__empty">
      <img src={`${import.meta.env.BASE_URL}prototype/home-diary.webp`} alt="" />
      <h2>Sua história começa aqui</h2>
      <p>Guarde sentimentos, momentos e fotos para reler sempre que quiser.</p>
      <Link className="button button--primary" to="/diario?escrever=1">Escrever minha primeira memória</Link>
    </section>}
  </AppShell>
}
