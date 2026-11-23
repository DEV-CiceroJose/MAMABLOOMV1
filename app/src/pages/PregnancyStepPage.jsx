import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFrame from '../components/AuthFrame.jsx'
import FormField from '../components/FormField.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { isNotFutureDate } from '../lib/validation.js'

function calculateWeeks(value) {
  if (!value) return null
  const start = new Date(`${value}T00:00:00`)
  if (Number.isNaN(start.getTime())) return null
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  return Math.max(0, Math.floor(days / 7))
}

export default function PregnancyStepPage() {
  const { finishRegistration, user } = useAuth()
  const [babyName, setBabyName] = useState(user?.pregnancy?.babyName || '')
  const [lastPeriod, setLastPeriod] = useState('')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const weeks = useMemo(() => calculateWeeks(lastPeriod), [lastPeriod])
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isNotFutureDate(lastPeriod) || weeks === null || weeks > 42) {
      setError('Confira a data informada. Para o protótipo, ela deve resultar em até 42 semanas.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await finishRegistration({ lastPeriod, weeks, babyName: babyName.trim() })
      navigate('/inicio', { replace: true })
    } catch (submissionError) {
      setSubmitError(submissionError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Sua gestação" subtitle="Conte em que momento dessa jornada você está." step="Etapa 2 de 2" illustration="baby">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="babyName" label="Nome do bebê" icon="baby" maxLength={80} value={babyName} onChange={(event) => setBabyName(event.target.value)} placeholder="Como seu bebê vai se chamar?" aria-describedby="baby-name-help" />
        <p id="baby-name-help" className="form-helper">Ainda não escolheu? Você pode preencher depois no seu perfil.</p>
        <FormField
          id="lastPeriod"
          label="Primeiro dia da última menstruação"
          icon="calendar"
          type="date"
          value={lastPeriod}
          onChange={(event) => { setLastPeriod(event.target.value); setError('') }}
          error={error}
        />
        <div className="pregnancy-preview" aria-live="polite">
          <span className="pregnancy-preview__icon"><Icon name="baby" size={30} /></span>
          <div>
            <strong>{weeks === null ? 'Informe a data' : `${weeks} semanas`}</strong>
            <span>{weeks === null ? 'A estimativa aparecerá aqui.' : 'Estimativa inicial para personalização.'}</span>
          </div>
        </div>
        <p className="form-helper">Essa estimativa não substitui a avaliação e a datação realizadas no pré-natal.</p>
        {submitError && <p className="field-error" role="alert">{submitError}</p>}
        <button className="button button--primary button--wide" type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Concluir cadastro'} <Icon name="check" /></button>
      </form>
      <p className="auth-switch"><Link to="/cadastro">Voltar para os dados pessoais</Link></p>
    </AuthFrame>
  )
}
