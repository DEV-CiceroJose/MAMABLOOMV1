import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePreviewPage from './pages/HomePreviewPage.jsx'
import AgendaPage from './pages/AgendaPage.jsx'
import BloomiePage from './pages/BloomiePage.jsx'
import CartPage from './pages/CartPage.jsx'
import DiaryPage from './pages/DiaryPage.jsx'
import DiaryReaderPage from './pages/DiaryReaderPage.jsx'
import EmergencyCardPage from './pages/EmergencyCardPage.jsx'
import HealthPage from './pages/HealthPage.jsx'
import InstitutionalPage from './pages/InstitutionalPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PregnancyStepPage from './pages/PregnancyStepPage.jsx'
import PlansPage from './pages/PlansPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import TrustedContactsPage from './pages/TrustedContactsPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/cadastro/gestacao" element={<PregnancyStepPage />} />
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <HomePreviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
      <Route path="/diario" element={<ProtectedRoute><DiaryPage /></ProtectedRoute>} />
      <Route path="/diario/memorias" element={<ProtectedRoute><DiaryReaderPage /></ProtectedRoute>} />
      <Route path="/saude" element={<ProtectedRoute><HealthPage /></ProtectedRoute>} />
      <Route path="/emergencia" element={<ProtectedRoute><EmergencyCardPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/bloomie" element={<ProtectedRoute><BloomiePage /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/apoio" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      <Route path="/apoio/contatos" element={<ProtectedRoute><TrustedContactsPage /></ProtectedRoute>} />
      <Route path="/loja" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
      <Route path="/carrinho" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/planos" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
      <Route path="/instituicoes" element={<ProtectedRoute><InstitutionalPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
