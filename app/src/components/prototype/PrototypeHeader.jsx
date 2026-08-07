import PrototypeSearch from './PrototypeSearch.jsx'

export default function PrototypeHeader({ actions, children, className = '', onSearchChange, search = false, searchValue = '', title, tone = 'cream' }) {
  return (
    <header className={`prototype-header prototype-header--${tone} ${className}`.trim()}>
      {(search || actions) && (
        <div className="prototype-header__bar">
          {search ? <PrototypeSearch value={searchValue} onChange={onSearchChange} /> : <span />}
          {actions && <div className="prototype-header__actions">{actions}</div>}
        </div>
      )}
      {title && <h1 className="canva-display-title">{title}</h1>}
      {children}
    </header>
  )
}
