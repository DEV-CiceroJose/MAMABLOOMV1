import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { createDefaultAppointments, moods } from '../data/demoData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatShortDate, toDateKey } from '../lib/date.js'

const shortcuts = [
  { to: '/agenda', icon: 'calendar', label: 'Agenda', detail: 'Consultas e lembretes', tone: 'yellow' },
  { to: '/diario', icon: 'message', label: 'Diário', detail: 'Emoções e memórias', tone: 'blue' },
  { to: '/saude', icon: 'activity', label: 'Saúde', detail: 'Check-in semanal', tone: 'mint' },
  { to: '/emergencia', icon: 'shield', label: 'Emergência', detail: 'Dados essenciais', tone: 'rose' },
]

export default function HomePreviewPage() {
  const { user } = useAuth()
  const [appointments] = useLocalData('mamabloom:appointments', createDefaultAppointments)
  const [entries] = useLocalData('mamabloom:diary', [])
  const [healthChecks] = useLocalData('mamabloom:health-checks', [])
  const weeks = user?.pregnancy?.weeks ?? 21
  const progress = Math.min(100, Math.round((weeks / 40) * 100))
  const today = toDateKey()
  const nextAppointment = [...appointments]
    .filter((item) => item.date >= today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  const latestMood = moods.find((mood) => mood.id === entries[0]?.mood)

  return (
    <AppShell>
      <section className="journey-card" aria-labelledby="greeting">
        <div>
          <p className="eyebrow eyebrow--light">Sua jornada</p>
          <h1 id="greeting">Olá, {user?.name}!</h1>
          <p>{weeks} semanas de gestação</p>
        </div>
        <img src={`${import.meta.env.BASE_URL}brand/bee-baby.webp`} alt="" />
        <div className="journey-progress" aria-label={`${progress}% da gestação estimada`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="daily-summary" aria-labelledby="summary-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hoje</p>
            <h2 id="summary-title">Como está sua jornada?</h2>
          </div>
        </div>
        <div className="summary-grid">
          <Link to="/agenda" className="summary-card">
            <span className="summary-card__icon"><Icon name="calendar" /></span>
            <div>
              <small>Próximo compromisso</small>
              <strong>{nextAppointment?.title || 'Nenhum agendado'}</strong>
              <span>{nextAppointment ? `${formatShortDate(nextAppointment.date)} · ${nextAppointment.time}` : 'Organize sua agenda'}</span>
            </div>
          </Link>
          <Link to="/diario" className="summary-card">
            <span className="summary-card__mood">{latestMood?.emoji || '🌼'}</span>
            <div>
              <small>Último humor</small>
              <strong>{latestMood?.label || 'Ainda não registrado'}</strong>
              <span>{entries.length ? 'Confira seu diário' : 'Conte como você está'}</span>
            </div>
          </Link>
        </div>
      </section>

      <section aria-labelledby="shortcuts-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Acesse</p>
            <h2 id="shortcuts-title">Cuidados e organização</h2>
          </div>
          <span>{healthChecks.length ? 'Check-in feito' : 'Check-in pendente'}</span>
        </div>
        <div className="shortcut-grid shortcut-grid--four">
          {shortcuts.map((shortcut) => (
            <Link className={`shortcut-card shortcut-card--${shortcut.tone}`} to={shortcut.to} key={shortcut.to}>
              <Icon name={shortcut.icon} size={28} />
              <strong>{shortcut.label}</strong>
              <span>{shortcut.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <article className="reading-card">
        <div>
          <p className="eyebrow eyebrow--light">Leitura do dia</p>
          <h2>Pequenos cuidados para uma gestação mais tranquila</h2>
          <p>Informações gerais de bem-estar para conversar com sua equipe de pré-natal.</p>
        </div>
        <span className="reading-card__badge"><Icon name="heart" size={24} /></span>
      </article>

      <section aria-labelledby="journey-tools-title">
        <div className="section-heading">
          <div><p className="eyebrow">Acompanhe</p><h2 id="journey-tools-title">Sua jornada em perspectiva</h2></div>
        </div>
        <div className="journey-tools">
          <Link to="/relatorios"><span><Icon name="chart" /></span><div><strong>Relatório gestacional</strong><small>Veja seus registros reunidos</small></div><Icon name="chevronRight" size={18} /></Link>
          <Link to="/apoio"><span><Icon name="heart" /></span><div><strong>Central de apoio</strong><small>Respiração, acolhimento e sua rede</small></div><Icon name="chevronRight" size={18} /></Link>
        </div>
      </section>
    </AppShell>
  )
}
