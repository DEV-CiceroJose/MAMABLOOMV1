import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

export default function AuthFrame({ children, illustration = 'flower', step, subtitle, title }) {
  return (
    <main className="auth-screen">
      <div className="auth-curve" aria-hidden="true" />
      <Link className="auth-logo-link" to="/" aria-label="Voltar ao início">
        <BrandLogo compact />
      </Link>
      <img
        className={`auth-bee auth-bee--${illustration}`}
        src={`${import.meta.env.BASE_URL}brand/${illustration === 'baby' ? 'bee-baby' : 'bee-flower'}.webp`}
        alt=""
      />
      <section className="auth-card" aria-labelledby="auth-title">
        {step && <p className="eyebrow">{step}</p>}
        <h1 id="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </section>
    </main>
  )
}
