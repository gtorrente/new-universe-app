// Página de Perfil do app Universo Catia
// Layout inspirado no Instagram com estética mística

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { 
  FaHeart, 
  FaComments, 
  FaShare, 
  FaTrash, 
  FaUser, 
  FaSignOutAlt, 
  FaCamera,
  FaChevronRight,
  FaCog
} from "react-icons/fa";
import Header from "../components/Header";
import avatarDefault from '../assets/avatar.png';

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        setCreditos(userSnap.exists() ? userSnap.data().creditos || 0 : 0);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Função para sair da conta
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Função para apagar conversas
  const handleClearConversations = () => {
    if (window.confirm("Tem certeza que deseja apagar todas as suas conversas? Esta ação não pode ser desfeita.")) {
      // TODO: Implementar limpeza das conversas no Firestore
      alert("Conversas apagadas com sucesso!");
    }
  };

  // Função para compartilhar app
  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: "Universo Catia",
        text: "Descubra seu universo astrológico com a Catia! ✨",
        url: window.location.origin
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header user={user} creditos={creditos} />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Seção do Perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar com botão de editar */}
            <div className="relative">
              <img
                src={user?.photoURL || avatarDefault}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-purple-200"
              />
              <button className="absolute -bottom-1 -right-1 bg-purple-500 text-white p-1.5 rounded-full hover:bg-purple-600 transition">
                <FaCamera size={12} />
              </button>
            </div>
            
            {/* Informações do usuário */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {user?.displayName || "Usuário"}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {user?.email || "email@exemplo.com"}
              </p>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition">
                Editar perfil
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Ações */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          
          {/* Seção 1: Conteúdo */}
          <div className="p-1">
            <button 
              className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group"
              onClick={() => navigate('/receitas-salvas')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <FaHeart size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Receitas Salvas</span>
              </div>
              <FaChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <FaComments size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Minhas Conversas</span>
              </div>
              <FaChevronRight size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-100"></div>

          {/* Seção 2: Ações */}
          <div className="p-1">
            <button 
              onClick={handleShareApp}
              className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <FaShare size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Indicar para um amigo</span>
              </div>
              <FaChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button 
              onClick={handleClearConversations}
              className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
                  <FaTrash size={20} className="text-red-600" />
                </div>
                <span className="text-gray-700 font-medium">Apagar conversas</span>
              </div>
              <FaChevronRight size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-100"></div>

          {/* Seção 3: Configurações */}
          <div className="p-1">
            <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <FaUser size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Editar dados pessoais</span>
              </div>
              <FaChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <FaCog size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Configurações</span>
              </div>
              <FaChevronRight size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-100"></div>

          {/* Seção 4: Sair */}
          <div className="p-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
                  <FaSignOutAlt size={20} className="text-red-600" />
                </div>
                <span className="text-red-600 font-medium">Sair da conta</span>
              </div>
              <FaChevronRight size={16} className="text-red-400" />
            </button>
          </div>
        </div>

        {/* Rodapé com versão */}
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>Universo Catia v1.0.0</p>
          <p className="mt-1">✨ Descubra seu universo astrológico</p>
        </div>
      </div>
    </div>
  );
}