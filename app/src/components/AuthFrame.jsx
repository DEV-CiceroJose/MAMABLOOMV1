export default function AuthFrame({ children, illustration = 'flower', step, subtitle, title }) {
  return (
    <main className={`auth-screen auth-screen--canva auth-screen--${illustration}`}>
      <div className="auth-artwork" aria-hidden="true">
        <div className="auth-curve">
          <span className="auth-curve__accent" />
          <span className="auth-curve__bubble auth-curve__bubble--one" />
          <span className="auth-curve__bubble auth-curve__bubble--two" />
        </div>
        <img
          className={`auth-bee auth-bee--${illustration}`}
          src={`${import.meta.env.BASE_URL}brand/${illustration === 'baby' ? 'bee-baby' : 'bee-flower'}.webp`}
          alt=""
        />
      </div>
      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-card__intro">
          {step && <p className="eyebrow">{step}</p>}
          <h1 id="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </header>
        {children}
      </section>
    </main>
  )
}
