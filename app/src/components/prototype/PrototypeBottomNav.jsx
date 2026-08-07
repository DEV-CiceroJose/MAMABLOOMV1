import { NavLink } from 'react-router-dom'
import Icon from '../Icon.jsx'

const items = [
  { icon: 'home', label: 'Início', to: '/inicio' },
  { icon: 'message', label: 'Bloomie', to: '/bloomie' },
  { icon: 'profile', label: 'Perfil', to: '/perfil' },
]

export default function PrototypeBottomNav({ tone = 'aqua' }) {
  return (
    <nav className={`prototype-bottom-nav prototype-bottom-nav--${tone}`} aria-label="Navegação principal do aplicativo">
      {items.map((item) => (
        <NavLink className={({ isActive }) => `prototype-bottom-nav__item${isActive ? ' is-active' : ''}`} to={item.to} key={item.to} aria-label={item.label}>
          <Icon name={item.icon} size={21} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
