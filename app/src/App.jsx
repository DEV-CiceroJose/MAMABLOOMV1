import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePreviewPage from './pages/HomePreviewPage.jsx'
import AgendaPage from './pages/AgendaPage.jsx'
import BloomiePage from './pages/BloomiePage.jsx'
import DiaryPage from './pages/DiaryPage.jsx'
import EmergencyCardPage from './pages/EmergencyCardPage.jsx'
import HealthPage from './pages/HealthPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PregnancyStepPage from './pages/PregnancyStepPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
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
      <Route path="/saude" element={<ProtectedRoute><HealthPage /></ProtectedRoute>} />
      <Route path="/emergencia" element={<ProtectedRoute><EmergencyCardPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/bloomie" element={<ProtectedRoute><BloomiePage /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/apoio" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
