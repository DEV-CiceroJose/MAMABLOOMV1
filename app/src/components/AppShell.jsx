import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import BrandLogo from './BrandLogo.jsx'
import Icon from './Icon.jsx'

const menuItems = [
  { to: '/agenda', icon: 'calendar', label: 'Agenda' },
  { to: '/diario', icon: 'message', label: 'Diário gestacional' },
  { to: '/saude', icon: 'activity', label: 'Saúde da mamãe' },
  { to: '/emergencia', icon: 'shield', label: 'Cartão de emergência' },
  { to: '/relatorios', icon: 'chart', label: 'Relatório gestacional' },
  { to: '/apoio', icon: 'heart', label: 'Central de apoio' },
]

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="app-screen">
      <header className="app-header">
        <Link to="/inicio" aria-label="Ir para o início">
          <BrandLogo compact />
        </Link>
        <div className="app-header__actions">
          <button className="icon-button" type="button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <button
        className={`drawer-backdrop${menuOpen ? ' drawer-backdrop--open' : ''}`}
        type="button"
        aria-label="Fechar menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`app-drawer${menuOpen ? ' app-drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="app-drawer__header">
          <BrandLogo compact />
          <button className="icon-button" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        <nav className="drawer-nav" aria-label="Recursos MamaBloom">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              <span><Icon name={item.icon} /></span>
              {item.label}
              <Icon name="chevronRight" size={18} />
            </NavLink>
          ))}
          <button type="button" disabled>
            <span><Icon name="home" /></span>
            Loja
            <small>Fase 4</small>
          </button>
        </nav>
        <button className="drawer-logout" type="button" onClick={handleLogout}>
          <Icon name="signOut" /> Sair da conta
        </button>
      </aside>

      <div className="app-content">{children}</div>
      <nav className="bottom-nav" aria-label="Navegação principal do aplicativo">
        <NavLink className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`} to="/inicio">
          <Icon name="home" />
          <span>Início</span>
        </NavLink>
        <NavLink className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`} to="/bloomie">
          <Icon name="message" />
          <span>Bloomie</span>
        </NavLink>
        <NavLink className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`} to="/perfil">
          <Icon name="profile" />
          <span>Perfil</span>
        </NavLink>
      </nav>
    </main>
  )
}
