import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { appointmentTypes, createDefaultAppointments } from '../data/demoData.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, formatShortDate, getMonthGrid, toDateKey } from '../lib/date.js'

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
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
  const upcomingAppointments = [...appointments]
    .filter((item) => item.date > selectedDate)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3)

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
    setVisibleMonth(new Date(`${form.date}T12:00:00`))
    setShowForm(false)
  }

  function removeAppointment(id) {
    setAppointments((current) => current.filter((item) => item.id !== id))
  }

  function renderEvent(item, upcoming = false) {
    return (
      <article className={`agenda-prototype__event${upcoming ? ' agenda-prototype__event--upcoming' : ''}`} key={item.id}>
        <div>
          <strong>{item.title}</strong>
          <small>{item.time} · {item.type}</small>
        </div>
        <span>{formatShortDate(item.date)}</span>
        <button type="button" onClick={() => removeAppointment(item.id)} aria-label={`Excluir ${item.title}`}>
          <Icon name="trash" size={16} />
        </button>
      </article>
    )
  }

  return (
    <AppShell
      className="agenda-prototype"
      header={({ openMenu }) => (
        <section className="agenda-prototype__hero">
          <PrototypeToolbar className="agenda-prototype__toolbar" search onMenu={openMenu} />
          <div className="agenda-prototype__dots" aria-hidden="true"><i /><i /><i /></div>
          <section className="agenda-prototype__calendar" aria-label="Calendário de compromissos">
            <header>
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><Icon name="arrowLeft" size={18} /></button>
              <strong>{new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(visibleMonth)}</strong>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês"><Icon name="chevronRight" size={18} /></button>
            </header>
            <div className="calendar-grid calendar-grid--weekdays">
              {weekdays.map((day) => <span key={day}>{day}</span>)}
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
        </section>
      )}
    >
      {showForm && (
        <form className="feature-form agenda-prototype__form" onSubmit={addAppointment}>
          <div className="feature-form__heading"><h2>Novo compromisso</h2><button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancelar</button></div>
          <label className="field-label">Título<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Consulta de pré-natal" required /></label>
          <div className="field-row">
            <label className="field-label">Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{appointmentTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="field-label">Horário<input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /></label>
          </div>
          <label className="field-label">Data<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
          <button className="button button--primary button--wide" type="submit">Salvar compromisso</button>
        </form>
      )}

      <section className="agenda-prototype__section" aria-labelledby="selected-date-title">
        <div className="agenda-prototype__heading">
          <h2 id="selected-date-title">{selectedDate === toDateKey() ? 'Marcados para hoje:' : formatLongDate(selectedDate)}</h2>
          <button type="button" onClick={openForm} aria-label="Adicionar compromisso"><Icon name="plus" size={18} /></button>
        </div>
        <div className="agenda-prototype__events">
          {selectedAppointments.length ? selectedAppointments.map((item) => renderEvent(item)) : <p className="agenda-prototype__empty">Nenhum compromisso neste dia.</p>}
        </div>
      </section>

      <section className="agenda-prototype__section" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title">Eventos Próximos:</h2>
        <div className="agenda-prototype__events">
          {upcomingAppointments.length ? upcomingAppointments.map((item) => renderEvent(item, true)) : <p className="agenda-prototype__empty">Sua agenda futura está livre.</p>}
        </div>
      </section>
    </AppShell>
  )
}
