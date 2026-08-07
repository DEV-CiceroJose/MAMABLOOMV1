import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function PageTitle({ action, backTo = '/inicio', eyebrow, title }) {
  return (
    <header className="page-title">
      <Link className="page-title__back" to={backTo} aria-label="Voltar">
        <Icon name="arrowLeft" size={20} />
      </Link>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      <div className="page-title__action">{action}</div>
    </header>
  )
}
