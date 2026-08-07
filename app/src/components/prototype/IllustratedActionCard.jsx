import { Link } from 'react-router-dom'

export default function IllustratedActionCard({ image, label, to }) {
  return (
    <Link className="illustrated-action-card" to={to}>
      <img src={image} alt="" />
      <strong>{label}</strong>
    </Link>
  )
}
