import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthFrame from '../components/AuthFrame.jsx'
import FormField from '../components/FormField.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { isValidIdentity, isValidPassword } from '../lib/validation.js'

export default function LoginPage() {
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!isValidIdentity(identity)) nextErrors.identity = 'Informe um e-mail ou CPF com 11 dígitos.'
    if (!isValidPassword(password)) nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    login(identity.trim())
    navigate(location.state?.from || '/inicio', { replace: true })
  }

  return (
    <AuthFrame title="Login" subtitle="Entre na sua conta para continuar sua jornada.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="identity"
          label="E-mail ou CPF"
          icon="idCard"
          value={identity}
          onChange={(event) => setIdentity(event.target.value)}
          placeholder="maria@email.com"
          autoComplete="username"
          error={errors.identity}
        />
        <FormField
          id="password"
          label="Senha"
          icon="lock"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Sua senha"
          autoComplete="current-password"
          error={errors.password}
          rightAction={
            <button
              className="input-action"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
            </button>
          }
        />
        <div className="form-meta">
          <button className="text-button" type="button" title="Disponível após integração com o backend">
            Esqueci minha senha
          </button>
        </div>
        <button className="button button--primary button--wide" type="submit">
          Entrar
          <Icon name="arrowRight" />
        </button>
      </form>
      <p className="auth-switch">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
      <p className="prototype-note">Nesta fase, o acesso é demonstrativo e fica salvo somente neste navegador.</p>
    </AuthFrame>
  )
}
