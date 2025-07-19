import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import MapaAstral from './pages/MapaAstral'
import Tarot from './pages/Tarot'
import Receitas from './pages/Receitas'
import Perfil from './pages/Perfil'
import Login from "./pages/Login";
import CatiaChat from './pages/CatiaChat';
import PrevisaoSemanal from './pages/PrevisaoSemanal';
import Diario from './pages/Diario';

import BottomNav from './components/BottomNav'

export default function App() {
  const location = useLocation();
  const hideNav = location.pathname === "/login";
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Conteúdo das páginas */}
      <main className="flex-1 pb-16"> {/* o padding-bottom evita que o conteúdo fique atrás do menu */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapa-astral"
            element={
              <ProtectedRoute>
                <MapaAstral />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tarot"
            element={
              <ProtectedRoute>
                <Tarot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receitas"
            element={
              <ProtectedRoute>
                <Receitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catia"
            element={
              <ProtectedRoute>
                <CatiaChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/previsao"
            element={
              <ProtectedRoute>
                <PrevisaoSemanal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diario"
            element={
              <ProtectedRoute>
                <Diario />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {/* Menu inferior fixo */}
      {!hideNav && <BottomNav />}
    </div>
  )
}
