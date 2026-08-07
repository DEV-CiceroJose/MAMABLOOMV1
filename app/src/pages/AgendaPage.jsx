import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { appointmentTypes, createDefaultAppointments } from '../data/demoData.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, getMonthGrid, toDateKey } from '../lib/date.js'

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function AgendaPage() {
  const [appointments, setAppointments] = useLocalData('mamabloom:appointments', createDefaultAppointments)
  const [selectedDate, setSelectedDate] = useState(toDateKey())
  const [visibleMonth, setVisibleMonth] = useState(() => new Date())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Consulta', date: toDateKey(), time: '09:00' })

  const monthCells = getMonthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth())
  const eventDates = useMemo(() => new Set(appointments.map((item) => item.date)), [appointments])
  const selectedAppointments = [...appointments]
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  function changeMonth(amount) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  function openForm() {
    setForm({ title: '', type: 'Consulta', date: selectedDate, time: '09:00' })
    setShowForm(true)
  }

  function addAppointment(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    setAppointments((current) => [...current, { ...form, title: form.title.trim(), id: createId(), reminder: true }])
    setSelectedDate(form.date)
    const createdDate = new Date(`${form.date}T12:00:00`)
    setVisibleMonth(createdDate)
    setShowForm(false)
  }

  function removeAppointment(id) {
    setAppointments((current) => current.filter((item) => item.id !== id))
  }

  return (
    <AppShell>
      <PageTitle
        eyebrow="Organização"
        title="Minha agenda"
        action={<button className="round-action" type="button" onClick={openForm} aria-label="Adicionar compromisso"><Icon name="plus" /></button>}
      />

      {showForm && (
        <form className="feature-form" onSubmit={addAppointment}>
          <div className="feature-form__heading">
            <h2>Novo compromisso</h2>
            <button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
          <label className="field-label">Título
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Consulta de pré-natal" required />
          </label>
          <div className="field-row">
            <label className="field-label">Tipo
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {appointmentTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="field-label">Horário
              <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required />
            </label>
          </div>
          <label className="field-label">Data
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          </label>
          <button className="button button--primary button--wide" type="submit">Salvar compromisso</button>
        </form>
      )}

      <section className="calendar-card" aria-label="Calendário de compromissos">
        <header className="calendar-card__header">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><Icon name="arrowLeft" size={19} /></button>
          <strong>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(visibleMonth)}</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês"><Icon name="chevronRight" size={19} /></button>
        </header>
        <div className="calendar-grid calendar-grid--weekdays">
          {weekdays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>
        <div className="calendar-grid">
          {monthCells.map((date, index) => {
            if (!date) return <span key={`empty-${index}`} />
            const key = toDateKey(date)
            const classes = ['calendar-day']
            if (key === selectedDate) classes.push('calendar-day--selected')
            if (key === toDateKey()) classes.push('calendar-day--today')
            if (eventDates.has(key)) classes.push('calendar-day--event')
            return <button className={classes.join(' ')} type="button" key={key} onClick={() => setSelectedDate(key)} aria-label={formatLongDate(key)}>{date.getDate()}</button>
          })}
        </div>
      </section>

      <section className="feature-section" aria-labelledby="selected-date-title">
        <div className="section-heading">
          <div><p className="eyebrow">Compromissos</p><h2 id="selected-date-title">{formatLongDate(selectedDate)}</h2></div>
          <button className="text-button" type="button" onClick={openForm}>Adicionar</button>
        </div>
        <div className="event-list">
          {selectedAppointments.length ? selectedAppointments.map((item) => (
            <article className="event-card" key={item.id}>
              <span className="event-card__time"><Icon name="clock" size={17} /> {item.time}</span>
              <div><strong>{item.title}</strong><small>{item.type}</small></div>
              <button type="button" onClick={() => removeAppointment(item.id)} aria-label={`Excluir ${item.title}`}><Icon name="trash" size={18} /></button>
            </article>
          )) : <div className="empty-state"><Icon name="calendar" /><p>Nenhum compromisso neste dia.</p><button type="button" onClick={openForm}>Adicionar agora</button></div>}
        </div>
      </section>
    </AppShell>
  )
}
