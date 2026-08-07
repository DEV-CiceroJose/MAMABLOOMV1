import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { useAuth } from '../hooks/useAuth.js'

const links = [
  { to: '/emergencia', icon: 'shield', label: 'Cartão de emergência', detail: 'Dados essenciais e contato' },
  { to: '/saude', icon: 'activity', label: 'Saúde da mamãe', detail: 'Check-ins de bem-estar' },
  { to: '/agenda', icon: 'calendar', label: 'Minha agenda', detail: 'Consultas e lembretes' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const weeks = user?.pregnancy?.weeks ?? 21

  return (
    <AppShell>
      <PageTitle eyebrow="Sua conta" title="Meu perfil" />
      <section className="profile-hero">
        <span className="profile-avatar"><Icon name="user" size={34} /></span>
        <div><h2>{user?.name}</h2><p>{user?.identity}</p><strong>{weeks} semanas de gestação</strong></div>
      </section>

      <section className="profile-links" aria-label="Dados e cuidados">
        {links.map((item) => (
          <Link to={item.to} key={item.to}>
            <span><Icon name={item.icon} /></span>
            <div><strong>{item.label}</strong><small>{item.detail}</small></div>
            <Icon name="chevronRight" size={18} />
          </Link>
        ))}
      </section>

      <aside className="profile-privacy"><Icon name="lock" /><div><strong>Privacidade nesta versão</strong><p>Seus registros são armazenados localmente no navegador. Sincronização segura entre dispositivos será conectada ao backend em uma etapa futura.</p></div></aside>
    </AppShell>
  )
}
