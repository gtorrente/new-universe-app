// Página de Perfil do app Universo Catia
// Layout inspirado no Instagram com estética mística

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebaseConfigFront";
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  FaHeart, 
  FaComments, 
  FaShare, 
  FaTrash, 
  FaUser, 
  FaSignOutAlt, 
  FaCamera,
  FaChevronRight,
  FaCog,
  FaTimes,
  FaEdit,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";
import Header from "../components/Header";
import { CardLoading, PageLoading } from "../components/LoadingStates";
import avatarDefault from '../assets/avatar.png';

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '', email: '', dataNascimento: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [clearingConversations, setClearingConversations] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Buscar dados do usuário
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Carregar dados do Firestore
          const userRef = doc(db, "usuarios", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCreditos(userData.creditos || 0);
            setEditForm({
              nome: firebaseUser.displayName || userData.nome || '',
              email: firebaseUser.email || userData.email || '',
              dataNascimento: userData.dataNascimento || ''
            });
          } else {
            setCreditos(0);
            setEditForm({
              nome: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              dataNascimento: ''
            });
          }

        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        setCreditos(0);
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Upload de foto de perfil
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Upload para Firebase Storage
      const timestamp = Date.now();
      const photoRef = ref(storage, `profile-photos/${user.uid}-${timestamp}`);
      
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      // Atualizar foto no Firebase Auth
      await updateProfile(user, { photoURL });

      // Atualizar foto no Firestore
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, { foto: photoURL });

      // Atualizar estado local
      setUser({ ...user, photoURL });
      
      console.log("✅ Foto de perfil atualizada com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao fazer upload da foto:", error);
      alert("Erro ao atualizar foto. Tente novamente.");
    } finally {
      setUploadingPhoto(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Função para sair da conta
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }, [navigate]);

  // Função para apagar conversas
  const handleClearConversations = async () => {
    setShowDeleteConfirm(true);
  };

  // Confirmação de apagar conversas
  const confirmClearConversations = async () => {
    if (!user) return;

    setClearingConversations(true);
    setShowDeleteConfirm(false);

    try {
      const collections = ['diario', 'leituras_tarot', 'ai_requests'];
      let deletedCount = 0;

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        const userDocs = snapshot.docs.filter(doc => 
          doc.data().userId === user.uid
        );

        // Deletar documentos do usuário
        for (const docToDelete of userDocs) {
          await deleteDoc(doc(db, collectionName, docToDelete.id));
          deletedCount++;
        }
      }

      // setConversationsCount(0); // This line was removed as per the edit hint
      alert(`${deletedCount} conversas foram apagadas com sucesso!`);
      
    } catch (error) {
      console.error("❌ Erro ao apagar conversas:", error);
      alert("Erro ao apagar conversas. Tente novamente.");
    } finally {
      setClearingConversations(false);
    }
  };

  // Função para compartilhar app
  const handleShareApp = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: "Universo Catia",
        text: "Descubra seu universo astrológico!",
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copiado para a área de transferência!");
    }
  }, []);

  // Editar perfil (otimizado)
  const handleEditProfile = useCallback(async () => {
    if (!user || !editForm.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setSavingProfile(true);

    try {
      // Atualizar nome no Firebase Auth
      await updateProfile(user, { displayName: editForm.nome.trim() });

      // Atualizar dados no Firestore
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        nome: editForm.nome.trim(),
        email: editForm.email.trim(),
        dataNascimento: editForm.dataNascimento
      });

      // Atualizar estado local
      setUser({ ...user, displayName: editForm.nome.trim() });
      
      setShowEditModal(false);
      console.log("✅ Perfil atualizado com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setSavingProfile(false);
    }
  }, [user, editForm]);

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
            {/* Avatar com câmera flutuante estilo Instagram */}
            <div className="relative">
              <img
                src={user?.photoURL || avatarDefault}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-3 border-white shadow-lg object-cover"
                onError={(e) => {
                  e.target.src = avatarDefault;
                }}
              />
              {/* Ícone de câmera flutuante */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition disabled:opacity-50 flex items-center justify-center shadow-lg border-2 border-white"
              >
                {uploadingPhoto ? (
                  <FaSpinner size={14} className="animate-spin" />
                ) : (
                  <FaCamera size={16} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            {/* Informações do usuário */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {user?.displayName || "Usuário"}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {user?.email || "email@exemplo.com"}
              </p>

            </div>
          </div>
        </div>

        {/* Lista de Ações Organizadas por Seções */}
        <div className="space-y-6">
          
          {/* Seção 1: Conteúdo e Atividades */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                📁 Conteúdo e Atividades
              </h3>
            </div>
            
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
              
              <button 
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition group"
                onClick={() => navigate('/minhas-conversas')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                    <FaComments size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-gray-700 font-medium">Minhas Conversas</span>
                  </div>
                </div>
                <FaChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Seção 2: Conta e Dados */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                👤 Conta e Dados
              </h3>
            </div>
            
            <div className="p-1">
              <button 
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                    <FaEdit size={20} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Editar Dados Pessoais</span>
                </div>
                <FaChevronRight size={16} className="text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate('/configuracoes')}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                    <FaCog size={20} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Configurações</span>
                </div>
                <FaChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Seção 3: Engajamento */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                📤 Engajamento
              </h3>
            </div>
            
            <div className="p-1">
              <button 
                onClick={handleShareApp}
                className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                    <FaShare size={20} className="text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Indicar para um amigo</span>
                </div>
                <FaChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Seção 4: Privacidade e Sessão */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
              <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
                🧹 Privacidade e Sessão
              </h3>
            </div>
            
            <div className="p-1">
              <button 
                onClick={handleClearConversations}
                disabled={clearingConversations}
                className="w-full flex items-center justify-between p-4 hover:bg-orange-50 transition group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition">
                    {clearingConversations ? (
                      <FaSpinner size={20} className="text-orange-600 animate-spin" />
                    ) : (
                      <FaTrash size={20} className="text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-gray-700 font-medium">Apagar conversas</span>
                  </div>
                </div>
                <FaChevronRight size={16} className="text-gray-400" />
              </button>

              {/* Divisor sutil */}
              <div className="mx-4 border-t border-gray-100"></div>
              
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
        </div>

        {/* Rodapé com versão */}
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>Universo Catia v1.0.0</p>
          <p className="mt-1">✨ Descubra seu universo astrológico</p>
        </div>
      </div>

      {/* Modal de Edição de Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Editar Dados Pessoais</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditProfile(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Seu email"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📧 O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={editForm.dataNascimento}
                    onChange={(e) => setEditForm({...editForm, dataNascimento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🎂 Usado para cálculos astrológicos mais precisos
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <FaSpinner size={16} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FaCheck size={16} />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup de confirmação para apagar conversas */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Apagar Conversas</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja apagar todas as suas conversas? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearConversations}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Apagar Conversas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}