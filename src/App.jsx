import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import MapaAstral from './pages/MapaAstral'
import Tarot from './pages/Tarot'
import Receitas from './pages/Receitas'
import Perfil from './pages/Perfil'
import Login from "./pages/Login";
import CatiaChat from './pages/CatiaChat'; 
import PrevisaoSemanal from './pages/PrevisaoSemanal';
import Diario from './pages/Diario';
import Registro from './pages/Registro';
import CategoriaReceita from './pages/CategoriaReceita';
import ReceitaExemplo from './pages/ReceitaExemplo';
import ReceitaCompleta from './pages/ReceitaCompleta';
import ReceitasAdmin from './pages/admin/ReceitasAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersAdmin from './pages/admin/UsersAdmin';
import EmailsAdmin from './pages/admin/EmailsAdmin';
import NotificationsAdmin from './pages/admin/NotificationsAdmin';
import ReceitasSalvas from './pages/ReceitasSalvas';
import MinhasConversas from './pages/MinhasConversas';
import Configuracoes from './pages/Configuracoes';
import ComprarCreditos from './pages/ComprarCreditos';
import CheckoutPagamento from './pages/CheckoutPagamento';

import BottomNav from './components/BottomNav'

export default function App() {
  const location = useLocation();
  const hideNav = ["/login", "/registro"].includes(location.pathname);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <ScrollToTop />
      {/* Conteúdo das páginas */}
      <main className="flex-1 pb-16"> {/* o padding-bottom evita que o conteúdo fique atrás do menu */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
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
          <Route
            path="/receitas/categoria/:id"
            element={
              <ProtectedRoute>
                <CategoriaReceita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receita-exemplo"
            element={
              <ProtectedRoute>
                <ReceitaExemplo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receita/:id"
            element={
              <ProtectedRoute>
                <ReceitaCompleta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receitas-salvas"
            element={
              <ProtectedRoute>
                <ReceitasSalvas />
              </ProtectedRoute>
            }
          />
          {/* Rotas de Administração - Protegidas */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <UsersAdmin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/emails" 
            element={
              <AdminRoute>
                <EmailsAdmin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/notifications" 
            element={
              <AdminRoute>
                <NotificationsAdmin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/receitas" 
            element={
              <AdminRoute>
                <ReceitasAdmin />
              </AdminRoute>
            } 
          />
          <Route
            path="/minhas-conversas"
            element={
              <ProtectedRoute>
                <MinhasConversas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comprar-creditos"
            element={
              <ProtectedRoute>
                <ComprarCreditos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout-pagamento"
            element={
              <ProtectedRoute>
                <CheckoutPagamento />
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
