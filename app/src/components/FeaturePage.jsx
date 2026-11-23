import { Link } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import PrototypeToolbar from './prototype/PrototypeToolbar.jsx'

export default function FeaturePage({ title, intro, children, tone = 'aqua' }) {
  return <AppShell className={`community-page community-page--${tone}`} header={({ openMenu }) => <header className={`community-header community-header--${tone}`}><PrototypeToolbar onMenu={openMenu} /><Link to="/apoio">← Central de apoio</Link><h1>{title}</h1>{intro && <p>{intro}</p>}</header>}><div className="community-content">{children}</div></AppShell>
}

export function Feedback({ error, status }) {
  return <>{error && <p className="field-error" role="alert">{error}</p>}{status && <p className="community-status" role="status">{status}</p>}</>
}

export function Avatar({ name, image }) {
  return image ? <img className="community-avatar" src={image} alt={`Foto de ${name}`} /> : <span className="community-avatar" aria-hidden="true">{name?.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('')}</span>
}
