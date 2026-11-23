import { useEffect, useRef, useState } from 'react'
import FeaturePage, { Avatar, Feedback } from '../components/FeaturePage.jsx'
import { useCommunity } from '../hooks/useCommunity.js'
import { useAuth } from '../hooks/useAuth.js'
import { communityApi } from '../lib/api.js'
import { saoPauloDay, statusLabel } from '../lib/psychology.js'
import PrivateChat from '../components/PrivateChat.jsx'
import ProfileEditor from '../components/ProfileEditor.jsx'

const dateLabel = (value) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
const timeLabel = (value) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', timeStyle: 'short' }).format(new Date(value))

export default function PsychologyPage() {
  const professionals = useCommunity('/professionals')
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('')
  return <FeaturePage title="Encontre seu psicólogo" intro="Escolha alguém para acompanhar sua jornada, no seu tempo.">
    <div className="community-actions"><a className="button button--outline community-jump" href="#minhas-consultas">Ver minhas consultas ↓</a></div>
    <Feedback error={professionals.error} status={status} />
    {!professionals.data && !professionals.error && <p role="status">Buscando profissionais…</p>}
    {professionals.data?.professionals.length === 0 && <p className="community-card">Ainda não há psicólogos aprovados. Novos profissionais aparecerão aqui após a aprovação.</p>}
    <div className="professional-list">{professionals.data?.professionals.map((person) => <article className={`community-card professional-card${selected?.userId === person.userId ? ' is-selected' : ''}`} key={person.userId}>
      <div className="professional-identity"><Avatar name={person.name} image={person.avatarImage} /><div><h2>{person.name}</h2><p>{person.age} anos · {person.registration}</p></div></div>
      <p className="eyebrow">{person.specialties}</p><dl><dt>Formação</dt><dd>{person.education}</dd><dt>Experiência</dt><dd>{person.experience}</dd></dl><p>{person.bio}</p>
      <button className="button button--primary" type="button" aria-expanded={selected?.userId === person.userId} onClick={() => { setSelected(person); setStatus('') }}>Ver dias e horários</button>
    </article>)}</div>
    {selected && <Booking key={selected.userId} person={selected} onBooked={() => { setSelected(null); setStatus('Consulta agendada. Veja os detalhes em Minhas consultas e na sua agenda.') }} />}
    <Consultations refreshKey={status} />
  </FeaturePage>
}

function Booking({ person, onBooked }) {
  const panel = useRef(null)
  useEffect(() => { panel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }) }, [])
  const { data, error, refresh } = useCommunity(`/slots/${person.userId}`)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const days = [...new Set(data?.slots.map((slot) => saoPauloDay(slot.startsAt)) || [])]
  async function reserve() {
    setBusy(true); setFailure('')
    try { await communityApi.post('/consultations', { slotId: selectedSlot.id }); onBooked() }
    catch (err) { setFailure(err.message); setSelectedSlot(null); await refresh() }
    finally { setBusy(false) }
  }
  return <section ref={panel} className="community-card booking-panel" aria-label={`Agenda de ${person.name}`}><h2>Agenda de {person.name}</h2><p>Horários de Brasília (America/Sao_Paulo)</p><Feedback error={failure || error} />
    {!data && !error && <p>Carregando horários…</p>}{data?.slots.length === 0 && <p>Sem horários disponíveis no momento.</p>}
    <div className="slot-options" aria-label="Dias disponíveis">{days.map((value) => <button className="button button--outline" type="button" aria-pressed={selectedDay === value} key={value} onClick={() => { setSelectedDay(value); setSelectedSlot(null) }}>{value.split('-').reverse().join('/')}</button>)}</div>
    <div className="slot-options" aria-label="Horários disponíveis">{data?.slots.filter((slot) => saoPauloDay(slot.startsAt) === selectedDay).map((slot) => <button className="button button--outline" type="button" key={slot.id} aria-pressed={selectedSlot?.id === slot.id} onClick={() => setSelectedSlot(slot)}>{timeLabel(slot.startsAt)} – {timeLabel(slot.endsAt)}</button>)}</div>
    {selectedSlot && <div className="booking-confirmation"><p><strong>{person.name}</strong><br />{dateLabel(selectedSlot.startsAt)} · sessão de {Math.round((new Date(selectedSlot.endsAt) - new Date(selectedSlot.startsAt)) / 60000)} minutos</p><button type="button" className="button button--primary" disabled={busy} onClick={reserve}>{busy ? 'Confirmando…' : 'Confirmar agendamento'}</button></div>}
  </section>
}

export function Consultations({ refreshKey = '' }) {
  const { user } = useAuth()
  const { data, error, refresh } = useCommunity('/consultations')
  const [conversation, setConversation] = useState(null)
  useEffect(() => { void refresh(); const timer = setInterval(refresh, 30000); return () => clearInterval(timer) }, [refresh, refreshKey])
  return <section id="minhas-consultas" className="consultations-section"><h2>Minhas consultas</h2><Feedback error={error} />
    {data?.consultations.length === 0 && <p>Você ainda não tem consultas agendadas.</p>}
    {data?.consultations.map((item) => <article key={item.id} className="community-card consultation-card"><p className="eyebrow">{statusLabel(item.status)}</p><h3>{item.professionalId === user.id ? item.patientName : item.professionalName}</h3><p>{dateLabel(item.startsAt)} – {timeLabel(item.endsAt)}<br /><small>Horário de Brasília</small></p>
      <div className="community-actions"><button className="button button--outline" type="button" onClick={() => setConversation(item)}>Conversar {item.professionalId === user.id ? 'com paciente' : 'com psicólogo'}</button>
      {item.canJoin ? <a className="button button--primary" href={item.meetUrl} target="_blank" rel="noreferrer">Entrar no Google Meet</a> : <small>{new Date(item.endsAt) < new Date() ? 'Consulta encerrada.' : saoPauloDay(item.startsAt) === saoPauloDay(Date.now()) ? 'Link da consulta ainda não disponível.' : 'O acesso ao Meet aparece no dia da consulta.'}</small>}</div>
      {item.professionalId === user.id && new Date(item.endsAt) > new Date() && <MeetForm consultation={item} onSaved={refresh} />}
    </article>)}
    {conversation && <PrivateChat key={conversation.id} path={`/consultations/${conversation.id}/messages`} name={conversation.professionalId === user.id ? conversation.patientName : conversation.professionalName} onClose={() => setConversation(null)} />}
  </section>
}

function MeetForm({ consultation, onSaved }) {
  const [url, setUrl] = useState(consultation.meetUrl)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setStatus('')
    try { await communityApi.put(`/consultations/${consultation.id}/meet`, { meetUrl: url }); setStatus('Link da reunião salvo.'); await onSaved() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <form className="community-form" onSubmit={save}><label>Link do Google Meet<input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://meet.google.com/xxx-xxxx-xxx" required /></label><small>Informe o link de uma reunião criada por você no Google Meet.</small><button className="button button--outline" type="submit" disabled={busy}>Salvar link</button><Feedback error={error} status={status} /></form>
}

export function ProfessionalPage() {
  const { user } = useAuth()
  const own = useCommunity('/me')
  const slots = useCommunity(`/slots/${user.id}`)
  const [form, setForm] = useState({ birthDate: user.birthDate || '', education: '', experience: '', registration: '', specialties: '', bio: '' })
  const [slot, setSlot] = useState({ startsAt: '', duration: 50 })
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingAccount, setEditingAccount] = useState(false)
  useEffect(() => { if (own.data?.professional) setForm(({ birthDate, education, experience, registration, specialties, bio }) => Object.fromEntries(Object.entries({ birthDate, education, experience, registration, specialties, bio }).map(([key, value]) => [key, own.data.professional[key] ?? value]))) }, [own.data])
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setStatus('')
    try { await communityApi.put('/professional', form); setStatus('Perfil enviado para análise. Aguarde a aprovação do administrador.'); await own.refresh() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function addSlot(event) {
    event.preventDefault(); setBusy(true); setError(''); setStatus('')
    try {
      await communityApi.post('/slots', { startsAt: new Date(`${slot.startsAt}:00-03:00`).toISOString(), duration: Number(slot.duration) })
      setStatus('Horário publicado.'); await slots.refresh()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <FeaturePage backTo={null} title="Meu painel profissional" intro="Cadastre seu perfil e acompanhe seus atendimentos."><Feedback error={error || own.error} status={status} />
    <div className="community-card"><h2>{user.name}</h2><p>Seus dados de conta identificam você nos atendimentos.</p><strong>{own.data?.professional ? statusLabel(own.data.professional.status) : 'Complete o cadastro profissional'}</strong>{own.data?.professional?.reason && <p>Justificativa: {own.data.professional.reason}</p>}<div className="community-actions"><button type="button" className="button button--outline" aria-expanded={editingAccount} onClick={() => setEditingAccount((value) => !value)}>Editar nome e foto</button></div>{editingAccount && <ProfileEditor showBabyName={false} onClose={() => setEditingAccount(false)} onSaved={() => setEditingAccount(false)} />}</div>
    <form className="community-card community-form" onSubmit={save}><h2>Perfil do psicólogo</h2><p>Após enviar ou alterar o perfil, ele passa pela aprovação do administrador.</p>
      {[['birthDate', 'Data de nascimento', 'date', 10], ['registration', 'Registro profissional (CRP)', 'text', 40], ['education', 'Formação', 'textarea', 800], ['experience', 'Experiência', 'textarea', 1200], ['specialties', 'Especialidades', 'text', 300], ['bio', 'Apresentação', 'textarea', 1200]].map(([key, label, type, max]) => <label key={key}>{label}{type === 'textarea' ? <textarea required maxLength={max} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /> : <input required type={type} maxLength={max} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}</label>)}<button className="button button--primary" disabled={busy} type="submit">Enviar para aprovação</button>
    </form>
    {own.data?.professional?.status === 'approved' && <section className="community-card"><h2>Disponibilidade</h2><form className="community-form" onSubmit={addSlot}><label>Dia e horário de Brasília<input type="datetime-local" value={slot.startsAt} required onChange={(e) => setSlot({ ...slot, startsAt: e.target.value })} /></label><label>Duração em minutos<input type="number" min="30" max="120" value={slot.duration} onChange={(e) => setSlot({ ...slot, duration: e.target.value })} required /></label><button type="submit" disabled={busy} className="button button--primary">Publicar horário</button></form><Feedback error={slots.error} /><ul>{slots.data?.slots.map((s) => <li key={s.id}>{dateLabel(s.startsAt)} – {timeLabel(s.endsAt)}</li>)}</ul></section>}
    <Consultations />
  </FeaturePage>
}
