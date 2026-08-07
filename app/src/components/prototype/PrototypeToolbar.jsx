import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import PrototypeSearch from './PrototypeSearch.jsx'

export default function PrototypeToolbar({ className = '', onMenu, onSearchChange, search = false, searchValue = '' }) {
  return (
    <div className={`prototype-toolbar ${className}`.trim()}>
      {search ? <PrototypeSearch value={searchValue} onChange={onSearchChange} /> : <span />}
      <Link className="prototype-toolbar__tool" to="/perfil" aria-label="Configurações">
        <Icon name="settings" size={23} />
      </Link>
      <button className="prototype-toolbar__menu" type="button" aria-label="Abrir menu" onClick={onMenu}>
        <Icon name="menu" size={31} />
      </button>
    </div>
  )
}
