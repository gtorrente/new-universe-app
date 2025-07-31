import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfigFront';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  FaArrowLeft, 
  FaBell, 
  FaMoon, 
  FaSun,
  FaShieldAlt,
  FaLanguage,
  FaVolumeUp,
  FaVolumeOff,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaDownload,
  FaCog,
  FaSpinner,
  FaCheck,
  FaQuestionCircle
} from 'react-icons/fa';
import { PageLoading } from '../components/LoadingStates';

export default function Configuracoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados das configurações
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      tarot: true,
      diary: true,
      ai: true
    },
    appearance: {
      darkMode: false,
      language: 'pt-BR',
      fontSize: 'medium'
    },
    privacy: {
      profileVisible: true,
      shareData: false,
      analytics: true
    },
    sound: {
      enabled: true,
      volume: 70
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadSettings(firebaseUser.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadSettings = async (userId) => {
    setLoading(true);
    try {
      const userRef = doc(db, "usuarios", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.settings) {
          setSettings({
            ...settings,
            ...userData.settings
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        settings: settings,
        lastUpdated: new Date()
      });
      
      console.log('✅ Configurações salvas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const toggleSetting = (category, key) => {
    updateSetting(category, key, !settings[category][key]);
  };

  const handleExportData = () => {
    if (window.confirm('Deseja baixar todos os seus dados? Isso pode levar alguns minutos.')) {
      // Implementar export de dados
      alert('Funcionalidade de exportação será implementada em breve!');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('ATENÇÃO: Tem certeza que deseja apagar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos permanentemente.')) {
      if (window.confirm('Digite "CONFIRMAR" para confirmar a exclusão da conta:') === 'CONFIRMAR') {
        // Implementar exclusão de conta
        alert('Funcionalidade de exclusão de conta será implementada em breve!');
      }
    }
  };

  if (loading) {
    return <PageLoading message="Carregando configurações..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/perfil')}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Configurações</h1>
            <p className="text-sm text-gray-500">Personalize sua experiência</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
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
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Notificações */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBell size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Notificações</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Notificações Push</p>
                <p className="text-sm text-gray-500">Receber notificações no dispositivo</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'push')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.notifications.push ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-500">Receber emails sobre atualizações</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'email')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.notifications.email ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Leituras de Tarot</p>
                <p className="text-sm text-gray-500">Lembretes para novas leituras</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'tarot')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.notifications.tarot ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.notifications.tarot ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Aparência */}
        {/* <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              {settings.appearance.darkMode ? (
                <FaMoon size={20} className="text-yellow-600" />
              ) : (
                <FaSun size={20} className="text-yellow-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Aparência</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Modo Escuro</p>
                <p className="text-sm text-gray-500">Interface em cores escuras</p>
              </div>
              <button
                onClick={() => toggleSetting('appearance', 'darkMode')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.appearance.darkMode ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.appearance.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-2">Tamanho da Fonte</p>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => updateSetting('appearance', 'fontSize', size)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      settings.appearance.fontSize === size
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div> */}

        {/* Som */}
        {/* <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              {settings.sound.enabled ? (
                <FaVolumeUp size={20} className="text-green-600" />
              ) : (
                <FaVolumeOff size={20} className="text-green-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Som</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Sons do App</p>
                <p className="text-sm text-gray-500">Efeitos sonoros e música</p>
              </div>
              <button
                onClick={() => toggleSetting('sound', 'enabled')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.sound.enabled ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.sound.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {settings.sound.enabled && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Volume: {settings.sound.volume}%</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sound.volume}
                  onChange={(e) => updateSetting('sound', 'volume', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div> */}

        {/* Privacidade */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaShieldAlt size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Privacidade</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Perfil Público</p>
                <p className="text-sm text-gray-500">Outros usuários podem ver seu perfil</p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'profileVisible')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.privacy.profileVisible ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.privacy.profileVisible ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Analytics</p>
                <p className="text-sm text-gray-500">Ajudar a melhorar o app com dados anônimos</p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'analytics')}
                className={`w-12 h-6 rounded-full transition ${
                  settings.privacy.analytics ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.privacy.analytics ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Dados */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FaDownload size={20} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Seus Dados</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <div className="flex items-center gap-3">
                <FaDownload size={16} className="text-blue-600" />
                <span className="font-medium text-blue-700">Baixar meus dados</span>
              </div>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
            >
              <div className="flex items-center gap-3">
                <FaTrash size={16} className="text-red-600" />
                <span className="font-medium text-red-700">Apagar minha conta</span>
              </div>
            </button>
          </div>
        </div>

        {/* Ajuda */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaQuestionCircle size={20} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Ajuda</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/sobre')}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <p className="font-medium text-gray-700">Sobre o Universo Catia</p>
              <p className="text-sm text-gray-500">Versão, termos e privacidade</p>
            </button>
            
            <button
              onClick={() => window.open('mailto:suporte@universocatia.com')}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <p className="font-medium text-gray-700">Contato e Suporte</p>
              <p className="text-sm text-gray-500">Fale conosco para dúvidas ou problemas</p>
            </button>
          </div>
        </div>

        {/* Informações */}
        <div className="text-center text-sm text-gray-400">
          <p>Universo Catia v1.0.0</p>
          <p className="mt-1">Suas configurações são salvas automaticamente</p>
        </div>
      </div>
    </div>
  );
} 