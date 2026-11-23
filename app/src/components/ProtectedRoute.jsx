import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useCommunity } from '../hooks/useCommunity.js'
import { AccessContext, accountArea } from '../context/access-context.js'

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="route-loading" role="status">Carregando sua jornada...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <AreaRoute location={location}>{children}</AreaRoute>
}

function AreaRoute({ children, location }) {
  const { data, error } = useCommunity('/me')
  if (error) return <div className="route-loading" role="alert">Não foi possível verificar seu acesso. Atualize a página para tentar novamente.</div>
  if (!data) return <div className="route-loading" role="status">Verificando seu acesso...</div>

  const area = accountArea(data)
  const destination = area === 'admin' ? '/administracao' : area === 'professional' ? '/psicologia/profissional' : '/inicio'
  const restricted = area === 'patient'
    ? ['/administracao', '/psicologia/profissional'].includes(location.pathname)
    : location.pathname !== destination
  if (restricted) return <Navigate to={destination} replace />

  return <AccessContext.Provider value={data}>{children}</AccessContext.Provider>
}
