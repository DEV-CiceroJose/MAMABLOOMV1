import { useState } from 'react'
import FormField from './FormField.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { isAdultEnough, isValidEmail } from '../lib/validation.js'

export default function ProfileEditor({ onClose, onSaved, showBabyName = true }) {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user.name, email: user.email, birthDate: user.birthDate || '', babyName: user.pregnancy?.babyName || '', avatarImage: user.avatarImage || '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  async function uploadPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 200000) {
      setErrors((current) => ({ ...current, avatarImage: 'Escolha uma foto PNG, JPG ou WebP de até 200 KB.' })); return
    }
    const reader = new FileReader()
    reader.onload = () => { setForm((current) => ({ ...current, avatarImage: String(reader.result) })); setErrors((current) => ({ ...current, avatarImage: '' })) }
    reader.onerror = () => setErrors((current) => ({ ...current, avatarImage: 'Não foi possível ler a foto.' }))
    reader.readAsDataURL(file)
  }

  async function save(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 3) nextErrors.name = 'Informe seu nome completo.'
    if (!isValidEmail(form.email.trim())) nextErrors.email = 'Informe um e-mail válido.'
    if (!isAdultEnough(form.birthDate)) nextErrors.birthDate = 'Informe uma data válida para uma pessoa com 16 anos ou mais.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      const payload = { ...form, name: form.name.trim(), email: form.email.trim() }
      if (!showBabyName) delete payload.babyName
      await updateProfile(payload)
      onSaved()
    } catch (error) {
      setErrors({ ...error.fields, form: error.message })
    } finally { setSubmitting(false) }
  }

  return <form className="personal-form" aria-label="Editar informações" onSubmit={save} noValidate>
    <h2>Editar informações</h2>
    <label className="field-label">Foto de perfil<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} /></label>
    <small>PNG, JPG ou WebP, até 200 KB.</small>
    {form.avatarImage && <><img className="community-avatar photo-preview" src={form.avatarImage} alt="Prévia da foto de perfil" /><button type="button" className="text-button" onClick={() => setForm({ ...form, avatarImage: '' })}>Remover foto</button></>}
    {errors.avatarImage && <p className="field-error" role="alert">{errors.avatarImage}</p>}
    <FormField id="profile-name" label="Nome completo" autoFocus autoComplete="name" maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} error={errors.name} />
    <FormField id="profile-email" label="E-mail" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} error={errors.email} />
    <FormField id="profile-birth" label="Data de nascimento" type="date" autoComplete="bday" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} error={errors.birthDate} />
    {showBabyName && <FormField id="profile-baby" label="Nome do bebê" maxLength={80} placeholder="Preencha quando escolher" value={form.babyName} onChange={(event) => setForm({ ...form, babyName: event.target.value })} error={errors.babyName} />}
    {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
    <div className="personal-form__actions">
      <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar alterações'}</button>
      <button className="button button--outline" type="button" onClick={onClose} disabled={submitting}>Cancelar</button>
    </div>
  </form>
}
