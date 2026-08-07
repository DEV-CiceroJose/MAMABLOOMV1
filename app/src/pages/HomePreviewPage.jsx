import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import IllustratedActionCard from '../components/prototype/IllustratedActionCard.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useAuth } from '../hooks/useAuth.js'

const extraLinks = [
  { to: '/saude', icon: 'activity', label: 'Saúde da mamãe' },
  { to: '/emergencia', icon: 'shield', label: 'Cartão de emergência' },
  { to: '/relatorios', icon: 'chart', label: 'Relatório gestacional' },
  { to: '/apoio', icon: 'heart', label: 'Central de apoio' },
  { to: '/loja', icon: 'bag', label: 'Loja MamaBloom' },
  { to: '/planos', icon: 'sparkles', label: 'Planos MamaBloom+' },
]

export default function HomePreviewPage() {
  const { user } = useAuth()
  const weeks = user?.pregnancy?.weeks ?? 21
  const month = Math.min(9, Math.max(1, Math.ceil(weeks / 4)))
  const firstName = (user?.name || 'Alícia').trim().split(/\s+/)[0].toLocaleUpperCase('pt-BR')
  const prototypeAsset = (name) => `${import.meta.env.BASE_URL}prototype/${name}`

  return (
    <AppShell
      className="home-prototype"
      header={({ openMenu }) => (
        <section className="home-prototype__hero" aria-labelledby="home-greeting">
          <PrototypeToolbar className="home-prototype__toolbar" search onMenu={openMenu} />
          <div className="home-prototype__journey">
            <div>
              <h1 id="home-greeting">{firstName}</h1>
              <p className="home-prototype__weeks"><strong>{weeks} Semanas</strong><span>{month}º mês de gestação</span></p>
            </div>
            <img src={prototypeAsset('home-pregnancy.webp')} alt="Ilustração do desenvolvimento do bebê" />
          </div>
        </section>
      )}
    >
      <section className="home-prototype__content" aria-labelledby="home-access-title">
        <h2 id="home-access-title">Acesse:</h2>
        <div className="home-prototype__actions">
          <IllustratedActionCard image={prototypeAsset('home-agenda.webp')} label="Agenda" to="/agenda" />
          <IllustratedActionCard image={prototypeAsset('home-diary.webp')} label="Diário" to="/diario" />
        </div>

        <h2>Faça a leitura do dia!</h2>
        <article className="home-prototype__reading">
          <img src={prototypeAsset('home-reading.webp')} alt="Gestante preparando a bolsa da maternidade" />
          <div>
            <strong>Gravidez Saudável:</strong>
            <span>orientações para uma boa gestação.</span>
          </div>
        </article>

        <section className="home-prototype__more" aria-labelledby="home-more-title">
          <h2 id="home-more-title">Continue explorando</h2>
          <div>
            {extraLinks.map((item) => (
              <Link to={item.to} key={item.to}>
                <span><Icon name={item.icon} size={21} /></span>
                <strong>{item.label}</strong>
                <Icon name="chevronRight" size={17} />
              </Link>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  )
}
