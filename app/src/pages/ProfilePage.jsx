import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import ProfileEditor from '../components/ProfileEditor.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function ProfilePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [shareMessage, setShareMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const weeks = user?.pregnancy?.weeks ?? 21
  const fullName = user?.name || 'Maria da Silva'

  async function shareProfile() {
    const text = `${fullName} está acompanhando sua jornada de ${weeks} semanas com o MamaBloom.`
    try {
      if (navigator.share) await navigator.share({ title: 'Meu perfil MamaBloom', text })
      else await navigator.clipboard.writeText(text)
      setShareMessage('Perfil pronto para compartilhar.')
    } catch {
      setShareMessage('Compartilhamento cancelado.')
    }
  }

  function leaveAccount() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell
      className="profile-prototype"
      header={({ openMenu }) => (
        <header className="profile-prototype__header">
          <h1>Perfil</h1>
          <PrototypeToolbar onMenu={openMenu} />
        </header>
      )}
    >
      <section className="profile-prototype__identity">
        <div className="profile-prototype__avatar"><Icon name="user" size={72} /></div>
        <h2>{fullName}</h2>
        <p>{user?.email || 'E-mail não informado'}</p>
      </section>

      <section className="profile-prototype__links" aria-label="Dados e cuidados">
        <div className="profile-prototype__pregnancy"><span><Icon name="baby" /></span><strong>Gestação em acompanhamento, {weeks} semanas</strong></div>
        <Link to="/emergencia"><span><Icon name="shield" /></span><strong>Cartão de emergência</strong></Link>
        <Link to="/agenda"><span><Icon name="calendar" /></span><strong>Minha Agenda</strong></Link>
        <button type="button" onClick={() => { setEditing(true); setProfileMessage('') }} aria-expanded={editing}><span><Icon name="edit" /></span><strong>Editar informações</strong></button>
        <button type="button" onClick={shareProfile}><span><Icon name="share" /></span><strong>Compartilhar perfil</strong></button>
      </section>
      {editing && <ProfileEditor onClose={() => setEditing(false)} onSaved={() => { setEditing(false); setProfileMessage('Informações atualizadas na sua conta.') }} />}
      {profileMessage && <p className="form-message" role="status">{profileMessage}</p>}
      {shareMessage && <p className="profile-prototype__message" role="status">{shareMessage}</p>}
      <aside className="profile-privacy"><Icon name="lock" /><div><strong>Privacidade e sincronização</strong><p>Seus registros ficam disponíveis neste dispositivo e são sincronizados com segurança na sua conta MamaBloom quando há conexão.</p></div></aside>
      <button className="profile-prototype__leave" type="button" onClick={leaveAccount}><Icon name="signOut" size={19} /> Deixar essa conta</button>
    </AppShell>
  )
}
