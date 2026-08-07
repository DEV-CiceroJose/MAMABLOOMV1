import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { createDefaultAppointments, moods } from '../data/demoData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, toDateKey } from '../lib/date.js'

export default function ReportsPage() {
  const { user } = useAuth()
  const [appointments] = useLocalData('mamabloom:appointments', createDefaultAppointments)
  const [entries] = useLocalData('mamabloom:diary', [])
  const [checks] = useLocalData('mamabloom:health-checks', [])
  const today = toDateKey()
  const nextAppointments = appointments.filter((item) => item.date >= today).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const moodCounts = moods.map((mood) => ({ ...mood, count: entries.filter((entry) => entry.mood === mood.id).length }))
  const totalMoods = Math.max(entries.length, 1)

  return (
    <AppShell>
      <PageTitle eyebrow="Sua jornada" title="Relatório gestacional" action={<button className="round-action" type="button" onClick={() => window.print()} aria-label="Imprimir relatório"><Icon name="chart" /></button>} />

      <section className="report-hero">
        <div><p className="eyebrow eyebrow--light">Resumo atual</p><h2>{user?.name}, você está na {user?.pregnancy?.weeks ?? 21}ª semana</h2><p>Um panorama dos registros feitos neste dispositivo.</p></div>
        <span><Icon name="chart" size={31} /></span>
      </section>

      <div className="report-metrics" aria-label="Resumo dos registros">
        <article><strong>{entries.length}</strong><span>registros no diário</span></article>
        <article><strong>{checks.length}</strong><span>check-ins de saúde</span></article>
        <article><strong>{nextAppointments.length}</strong><span>compromissos futuros</span></article>
      </div>

      <section className="report-section" aria-labelledby="moods-report-title">
        <div className="section-heading"><div><p className="eyebrow">Bem-estar emocional</p><h2 id="moods-report-title">Humores registrados</h2></div></div>
        <div className="mood-report">
          {moodCounts.map((mood) => (
            <div key={mood.id}><span>{mood.emoji}</span><div><strong>{mood.label}</strong><span><i style={{ width: `${(mood.count / totalMoods) * 100}%` }} /></span></div><b>{mood.count}</b></div>
          ))}
        </div>
      </section>

      <section className="report-section" aria-labelledby="health-report-title">
        <div className="section-heading"><div><p className="eyebrow">Acompanhamento</p><h2 id="health-report-title">Último check-in</h2></div></div>
        {checks[0] ? <article className="report-check"><span><Icon name="activity" /></span><div><small>{formatLongDate(checks[0].date)}</small><strong>Energia {checks[0].energy}/5 · Sono {checks[0].sleep}</strong><p>{checks[0].symptoms || 'Nenhum sintoma registrado.'}</p></div></article> : <p className="report-empty">Faça seu primeiro check-in para acompanhar esta área.</p>}
      </section>

      <aside className="report-disclaimer"><Icon name="alert" /><p>Este relatório organiza registros pessoais e não é prontuário médico. Compartilhe as informações relevantes com sua equipe de pré-natal.</p></aside>
    </AppShell>
  )
}
