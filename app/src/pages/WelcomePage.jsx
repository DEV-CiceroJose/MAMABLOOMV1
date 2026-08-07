import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function WelcomePage() {
  const { user } = useAuth()

  return (
    <main className="welcome-screen">
      <div className="welcome-screen__top">
        <BrandLogo />
        <div className="bee-scene" aria-hidden="true">
          <span className="bee-scene__halo" />
          <img
            className="bee-scene__flower"
            src={`${import.meta.env.BASE_URL}brand/bee-flower.webp`}
            alt=""
          />
          <img
            className="bee-scene__baby"
            src={`${import.meta.env.BASE_URL}brand/bee-baby.webp`}
            alt=""
          />
        </div>
      </div>
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <p className="eyebrow eyebrow--light">Sua jornada começa aqui</p>
        <h1 id="welcome-title">Bem-vinda ao MamaBloom!</h1>
        <p>Floresça na maternidade com informação, cuidado e acolhimento em cada etapa.</p>
        <div className="welcome-actions">
          {user ? (
            <Link className="button button--primary button--wide" to="/inicio">
              Continuar como {user.name}
              <Icon name="arrowRight" />
            </Link>
          ) : (
            <>
              <Link className="button button--primary button--wide" to="/cadastro">
                Criar minha conta
                <Icon name="arrowRight" />
              </Link>
              <Link className="button button--ghost button--wide" to="/login">
                Já tenho uma conta
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
