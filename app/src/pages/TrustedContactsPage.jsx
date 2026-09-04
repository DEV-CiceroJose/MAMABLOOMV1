import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import FormField from '../components/FormField.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useLocalData } from '../hooks/useLocalData.js'

const emptyContact = { name: '', phone: '', relationship: '' }
const relationships = ['Amigo(a)', 'Familiar', 'Parceiro(a)', 'Vizinho(a)', 'Outro']

export default function TrustedContactsPage() {
  const [contacts, setContacts] = useLocalData('mamabloom:trusted-contacts', [])
  const [form, setForm] = useState(emptyContact)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [removed, setRemoved] = useState(null)

  function saveContact(event) {
    event.preventDefault()
    const phone = form.phone.trim().replace(/[^\d+]/g, '')
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Informe o nome do contato.'
    if (!/^\+?\d{10,15}$/.test(phone)) nextErrors.phone = 'Informe um telefone com DDD válido.'
    if (!relationships.includes(form.relationship)) nextErrors.relationship = 'Escolha o vínculo com essa pessoa.'
    if (!editingId && contacts.length >= 100) nextErrors.form = 'Sua rede já tem 100 contatos. Edite ou remova um contato para continuar.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const contact = { ...form, name: form.name.trim(), phone, id: editingId || crypto.randomUUID() }
    try {
      setContacts((current) => editingId ? current.map((item) => item.id === editingId ? contact : item) : [...current, contact])
      setForm(emptyContact)
      setEditingId(null)
      setRemoved(null)
      setMessage('Contato salvo. Você pode ligar para essa pessoa pela sua rede de apoio.')
    } catch { setErrors({ form: 'Não foi possível salvar o contato neste dispositivo. Tente novamente.' }) }
  }

  function editContact(contact) {
    setForm({ name: contact.name, phone: contact.phone, relationship: contact.relationship })
    setEditingId(contact.id)
    setErrors({})
    setMessage('')
    document.getElementById('contact-name')?.focus()
  }

  return (
    <AppShell className="contacts-prototype wellness-prototype" header={({ openMenu }) => (
      <header className="wellness-prototype__header">
        <Link className="contacts-back" to="/apoio" aria-label="Voltar para a Central de apoio"><Icon name="arrowLeft" /></Link>
        <h1>Contatos de confiança</h1>
        <PrototypeToolbar onMenu={openMenu} />
      </header>
    )}>
      <p className="contacts-intro">Adicione pessoas que você conhece e em quem confia para acompanhar sua jornada.</p>
      <form className="personal-form" aria-label={editingId ? 'Editar contato' : 'Adicionar contato'} onSubmit={saveContact} noValidate>
        <h2>{editingId ? 'Editar contato' : 'Adicionar contato'}</h2>
        <FormField id="contact-name" label="Nome do contato" autoComplete="off" maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} error={errors.name} />
        <FormField id="contact-phone" label="Telefone" type="tel" inputMode="tel" autoComplete="off" maxLength={24} placeholder="(85) 99999-9999" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} error={errors.phone} />
        <div className="form-field">
          <label htmlFor="contact-relationship">Vínculo</label>
          <select id="contact-relationship" value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} aria-invalid={Boolean(errors.relationship)} aria-describedby={errors.relationship ? 'relationship-error' : undefined}>
            <option value="">Selecione o vínculo</option>
            {relationships.map((relationship) => <option key={relationship}>{relationship}</option>)}
          </select>
          {errors.relationship && <p id="relationship-error" className="field-error">{errors.relationship}</p>}
        </div>
        {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
        <div className="personal-form__actions">
          <button type="submit" className="button button--primary">Salvar contato</button>
          {editingId && <button type="button" className="button button--outline" onClick={() => { setEditingId(null); setForm(emptyContact); setErrors({}) }}>Cancelar</button>}
        </div>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
      <section className="trusted-contacts" aria-labelledby="trusted-list-title">
        <h2 id="trusted-list-title">Sua rede de apoio</h2>
        {!contacts.length && <p>Seus contatos aparecerão aqui.</p>}
        {contacts.map((contact) => <article key={contact.id}>
          <div><h3>{contact.name}</h3><small>{contact.relationship}</small><p>{contact.phone}</p></div>
          <div className="trusted-contacts__actions">
            <a href={`tel:${contact.phone}`} aria-label={`Ligar para ${contact.name}`}><Icon name="phone" size={18} /> Ligar</a>
            <button type="button" aria-label={`Editar ${contact.name}`} onClick={() => editContact(contact)}><Icon name="edit" size={18} /></button>
            <button type="button" aria-label={`Remover ${contact.name}`} onClick={() => { setContacts((current) => current.filter((item) => item.id !== contact.id)); setRemoved(contact); if (editingId === contact.id) { setEditingId(null); setForm(emptyContact) } }}><Icon name="trash" size={18} /></button>
          </div>
        </article>)}
        {removed && <div className="contacts-undo" role="status">{removed.name} foi removido. <button type="button" onClick={() => { setContacts((current) => [...current, removed]); setRemoved(null) }}>Desfazer</button></div>}
      </section>
    </AppShell>
  )
}
