import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { Avatar, Feedback } from '../components/FeaturePage.jsx'
import { useLocalData } from '../hooks/useLocalData.js'
import { useCommunity } from '../hooks/useCommunity.js'
import { communityApi } from '../lib/api.js'
import { ArticleCards } from './ArticlesPage.jsx'
import PrivateChat from '../components/PrivateChat.jsx'

export default function SupportPage() {
  const [contacts] = useLocalData('mamabloom:trusted-contacts', [])
  const { data, error, refresh } = useCommunity('/friends')
  const [status, setStatus] = useState('')
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState('')
  const [chatFriend, setChatFriend] = useState(null)
  async function addFriend(profile) {
    setBusy(profile.id); setFailure(''); setStatus('')
    try { await communityApi.post('/friends', { userId: profile.id }); setStatus(`${profile.name} foi adicionada à sua rede de amigas.`); await refresh() }
    catch (err) { setFailure(err.message) } finally { setBusy('') }
  }
  return <AppShell className="support-prototype" header={({ openMenu }) => <header className="support-prototype__header"><PrototypeToolbar onMenu={openMenu} /><h1>Precisando de apoio,<br />mamãe? Estamos aqui<br />para isso!</h1></header>}>
    <section className={contacts.length ? 'support-prototype__empty-state has-support' : 'support-prototype__empty-state'}><span><Icon name="users" size={28} /></span><div><h2>{contacts.length ? 'Sua rede de apoio' : 'Sem apoio cadastrado'}</h2><p>{contacts.length ? `${contacts.length} pessoas de confiança cadastradas.` : 'Adicione amigos e familiares para acompanhar esta jornada.'}</p></div><Link to="/apoio/contatos">{contacts.length ? 'Ver contatos' : 'Adicionar apoio'}</Link></section>
    <Link className="support-prototype__therapy" to="/psicologia"><span className="support-prototype__therapy-icon"><Icon name="psychology" size={62} /></span><span><strong>Agende uma sessão<br />de terapia!</strong><small>Escolha seu psicólogo, veja os horários e encontre um espaço para cuidar de você.</small></span></Link>
    <section className="community-card friends-section"><h2>Converse com as outras mamães!</h2><Feedback error={failure || error} status={status} />{data?.friends.length === 0 && <p>Adicione os perfis sugeridos para ampliar sua rede.</p>}<div className="friend-list">{data?.friends.map((friend) => <div className="friend-row" key={friend.id}><div className="professional-identity"><Avatar name={friend.name} image={friend.avatarImage} /><div><strong>{friend.name}</strong><small>Adicionada à sua rede</small></div></div><button className="text-button" type="button" onClick={() => setChatFriend(friend)} aria-label={`Conversar com ${friend.name}`}>Conversar</button></div>)}</div></section>
    {chatFriend && <PrivateChat key={chatFriend.id} path={`/friends/${chatFriend.id}/messages`} name={chatFriend.name} onClose={() => setChatFriend(null)} />}
    <section className="support-prototype__suggested" aria-labelledby="suggested-title"><header><h2 id="suggested-title">Perfis sugeridos para você:</h2></header>{data?.suggestions.length === 0 && <p>Nenhum novo perfil por enquanto.</p>}<div className="support-prototype__profiles" tabIndex={0} role="region" aria-label="Perfis sugeridos, deslize para os lados">{data?.suggestions.map((profile) => <article key={profile.id}><div className="support-prototype__suggested-avatar"><div className="support-prototype__suggested-avatar-frame"><Avatar name={profile.name} image={profile.avatarImage} /></div><button type="button" onClick={() => addFriend(profile)} disabled={Boolean(busy)} aria-label={`Adicionar ${profile.name} como amiga`}>{busy === profile.id ? '…' : '+'}</button></div><strong>{profile.name}</strong></article>)}</div></section>
    <section aria-labelledby="support-articles-title"><h2 id="support-articles-title">Leituras para sua jornada</h2><ArticleCards /><Link to="/artigos">Explorar todos os artigos</Link></section>
    <section className="support-network"><div><p className="eyebrow">Sua rede</p><h2>Contato de confiança</h2></div><Link to="/apoio/contatos"><span><Icon name="users" /></span><div><strong>{contacts.length ? 'Gerenciar contatos' : 'Adicionar apoio'}</strong><small>Cadastre amigos e familiares de confiança</small></div><Icon name="chevronRight" size={18} /></Link></section>
  </AppShell>
}
