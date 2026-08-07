import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'

export default function CanvaPageTitle({ action, backTo = '/inicio', eyebrow, title }) {
  return (
    <header className="canva-page-title">
      <Link className="canva-page-title__back" to={backTo} aria-label="Voltar"><Icon name="arrowLeft" size={20} /></Link>
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>
      <div className="canva-page-title__action">{action}</div>
    </header>
  )
}
