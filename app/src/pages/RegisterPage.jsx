import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFrame from '../components/AuthFrame.jsx'
import FormField from '../components/FormField.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../hooks/useAuth.js'
import {
  isAdultEnough,
  isValidEmail,
  isValidIdentity,
  isValidPassword,
} from '../lib/validation.js'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', cpf: '', email: '', birthDate: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState({})
  const { saveRegistrationDraft } = useAuth()
  const navigate = useNavigate()

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().split(/\s+/).length < 2) nextErrors.name = 'Informe seu nome e sobrenome.'
    if (!isValidIdentity(form.cpf) || form.cpf.includes('@')) nextErrors.cpf = 'Informe um CPF com 11 dígitos.'
    if (!isValidEmail(form.email)) nextErrors.email = 'Informe um e-mail válido.'
    if (!isAdultEnough(form.birthDate)) nextErrors.birthDate = 'O MamaBloom é destinado a pessoas com 16 anos ou mais.'
    if (!isValidPassword(form.password)) nextErrors.password = 'Use pelo menos 6 caracteres.'
    if (!accepted) nextErrors.accepted = 'Você precisa confirmar para continuar.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const { password: _password, ...safeDraft } = form
    saveRegistrationDraft(safeDraft)
    navigate('/cadastro/gestacao')
  }

  return (
    <AuthFrame
      title="Cadastro"
      subtitle="Preencha seus dados para começar sua jornada com o MamaBloom."
      step="Etapa 1 de 2"
      illustration="baby"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="name" label="Nome completo" icon="user" value={form.name} onChange={update('name')} autoComplete="name" placeholder="Maria da Silva" error={errors.name} />
        <FormField id="cpf" label="CPF" icon="idCard" value={form.cpf} onChange={update('cpf')} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" error={errors.cpf} />
        <FormField id="email" label="E-mail" icon="mail" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="maria@email.com" error={errors.email} />
        <FormField id="birthDate" label="Data de nascimento" icon="calendar" type="date" value={form.birthDate} onChange={update('birthDate')} autoComplete="bday" error={errors.birthDate} />
        <FormField
          id="newPassword"
          label="Crie uma senha"
          icon="lock"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={update('password')}
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
          error={errors.password}
          rightAction={
            <button className="input-action" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
            </button>
          }
        />
        <label className="check-field">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span>Confirmo que tenho 16 anos ou mais e concordo com a Política de Privacidade.</span>
        </label>
        {errors.accepted && <p className="field-error">{errors.accepted}</p>}
        <button className="button button--primary button--wide" type="submit">Avançar <Icon name="arrowRight" /></button>
      </form>
      <p className="auth-switch">Já possui uma conta? <Link to="/login">Entrar</Link></p>
    </AuthFrame>
  )
}
