import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfigFront';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  FaArrowLeft, 
  FaBell, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaPaperPlane,
  FaUsers,
  FaMobileAlt,
  FaDesktop,
  FaChartBar,
  FaClock,
  FaPlay,
  FaPause
} from 'react-icons/fa';

export default function NotificationsAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  
  const [form, setForm] = useState({
    titulo: '',
    corpo: '',
    icone: '',
    url: '',
    publico: 'todos',
    dispositivo: 'todos',
    agendamento: '',
    status: 'rascunho'
  });

  // Estados para estatísticas
  const [pushStats, setPushStats] = useState({
    totalEnviadas: 0,
    taxaClique: 0,
    dispositivos: {
      mobile: 0,
      desktop: 0
    },
    notificacoesAtivas: 0
  });

  // Estados para configurações
  const [pushConfig, setPushConfig] = useState({
    vapidKey: '',
    firebaseConfig: {},
    enabled: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadNotifications(),
        loadPushStats(),
        loadPushConfig()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationsSnap = await getDocs(
        query(collection(db, 'push_notifications'), orderBy('createdAt', 'desc'))
      );
      const notificationsData = notificationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadPushStats = async () => {
    // Simular estatísticas - em produção, buscar do analytics/Firebase
    setPushStats({
      totalEnviadas: 3247,
      taxaClique: 18.5,
      dispositivos: {
        mobile: 2156,
        desktop: 1091
      },
      notificacoesAtivas: notifications.filter(n => n.status === 'ativa').length
    });
  };

  const loadPushConfig = async () => {
    try {
      const configSnap = await getDocs(collection(db, 'push_config'));
      if (!configSnap.empty) {
        const config = configSnap.docs[0].data();
        setPushConfig(config);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSaveNotification = async () => {
    try {
      const notificationData = {
        ...form,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        enviadas: 0,
        cliques: 0
      };

      if (editingNotification) {
        await updateDoc(doc(db, 'push_notifications', editingNotification.id), {
          ...notificationData,
          createdAt: editingNotification.createdAt // Manter data original
        });
      } else {
        await addDoc(collection(db, 'push_notifications'), notificationData);
      }

      await loadNotifications();
      setShowModal(false);
      setEditingNotification(null);
      setForm({
        titulo: '',
        corpo: '',
        icone: '',
        url: '',
        publico: 'todos',
        dispositivo: 'todos',
        agendamento: '',
        status: 'rascunho'
      });
      
      alert(editingNotification ? 'Notificação atualizada!' : 'Notificação criada!');
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
      alert('Erro ao salvar notificação.');
    }
  };

  const handleDeleteNotification = async (id, titulo) => {
    if (window.confirm(`Deletar notificação "${titulo}"?`)) {
      try {
        await deleteDoc(doc(db, 'push_notifications', id));
        await loadNotifications();
        alert('Notificação deletada!');
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar notificação.');
      }
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setForm(notification);
    setShowModal(true);
  };

  const handleSendNotification = async (notification) => {
    if (window.confirm(`Enviar notificação "${notification.titulo}" agora?`)) {
      try {
        // Atualizar status para enviada
        await updateDoc(doc(db, 'push_notifications', notification.id), {
          status: 'enviada',
          enviadaEm: serverTimestamp()
        });

        // Aqui você integraria com o serviço de push notifications
        // Por exemplo: Firebase Cloud Messaging (FCM)
        await sendPushNotification(notification);
        
        await loadNotifications();
        alert('Notificação enviada com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        alert('Erro ao enviar notificação.');
      }
    }
  };

  // Função para enviar push notification (implementação futura)
  const sendPushNotification = async (notification) => {
    console.log('🔔 Enviando push notification:', notification);
    
    // Implementação futura com FCM:
    // 1. Buscar tokens dos dispositivos
    // 2. Filtrar por público-alvo
    // 3. Enviar via FCM API
    // 4. Registrar estatísticas
    
    // Exemplo de payload:
    const payload = {
      notification: {
        title: notification.titulo,
        body: notification.corpo,
        icon: notification.icone || '/icon-192x192.png',
        click_action: notification.url || '/'
      },
      data: {
        url: notification.url || '/',
        timestamp: Date.now().toString()
      }
    };
    
    console.log('📤 Payload:', payload);
    return Promise.resolve(); // Simular sucesso
  };

  const handleTestNotification = async () => {
    // Enviar notificação de teste para o próprio admin
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Teste - Universo Catia', {
          body: 'Esta é uma notificação de teste do painel admin',
          icon: '/icon-192x192.png'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Teste - Universo Catia', {
            body: 'Esta é uma notificação de teste do painel admin',
            icon: '/icon-192x192.png'
          });
        }
      } else {
        alert('Notificações não são suportadas ou foram negadas pelo navegador.');
      }
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      alert('Erro ao testar notificação.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <FaArrowLeft />
              Voltar
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                🔔 Push Notifications
              </h1>
              <p className="text-gray-600">
                Gerencie notificações push para engajar usuários
              </p>
            </div>
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <FaBell />
              Testar Notificação
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaPaperPlane className="text-blue-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enviadas</p>
                <p className="text-2xl font-bold text-gray-900">{pushStats.totalEnviadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaChartBar className="text-green-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Clique</p>
                <p className="text-2xl font-bold text-gray-900">{pushStats.taxaClique}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaMobileAlt className="text-orange-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Dispositivos Mobile</p>
                <p className="text-2xl font-bold text-gray-900">{pushStats.dispositivos.mobile}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaDesktop className="text-purple-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Dispositivos Desktop</p>
                <p className="text-2xl font-bold text-gray-900">{pushStats.dispositivos.desktop}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações Rápidas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Configurações Push</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Status do Serviço</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${pushConfig.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{pushConfig.enabled ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">VAPID Key</h3>
              <p className="text-sm text-gray-600">
                {pushConfig.vapidKey ? '✅ Configurada' : '❌ Não configurada'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Permissões</h3>
              <p className="text-sm text-gray-600">
                {Notification?.permission === 'granted' ? '✅ Permitidas' : 
                 Notification?.permission === 'denied' ? '❌ Negadas' : 
                 '⚠️ Não solicitadas'}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Notificações Push</h2>
              <button
                onClick={() => {
                  setEditingNotification(null);
                  setForm({
                    titulo: '',
                    corpo: '',
                    icone: '',
                    url: '',
                    publico: 'todos',
                    dispositivo: 'todos',
                    agendamento: '',
                    status: 'rascunho'
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                <FaPlus />
                Nova Notificação
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Público</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatísticas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.titulo}</div>
                        <div className="text-sm text-gray-500">{notification.corpo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.publico === 'todos' ? 'Todos os usuários' : notification.publico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {notification.dispositivo === 'mobile' ? 
                          <FaMobileAlt className="text-blue-500" /> : 
                          notification.dispositivo === 'desktop' ? 
                          <FaDesktop className="text-gray-500" /> : 
                          <FaUsers className="text-purple-500" />
                        }
                        {notification.dispositivo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        notification.status === 'enviada' 
                          ? 'bg-green-100 text-green-800'
                          : notification.status === 'agendada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Enviadas: {notification.enviadas || 0}</div>
                      <div>Cliques: {notification.cliques || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {notification.status === 'rascunho' && (
                          <button
                            onClick={() => handleSendNotification(notification)}
                            className="text-green-600 hover:text-green-900"
                            title="Enviar agora"
                          >
                            <FaPlay />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditNotification(notification)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteNotification(notification.id, notification.titulo)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Notificação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingNotification ? 'Editar Notificação' : 'Nova Notificação'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Nova funcionalidade disponível!"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corpo da Mensagem</label>
                <textarea
                  value={form.corpo}
                  onChange={(e) => setForm({ ...form, corpo: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Descreva o que o usuário verá na notificação"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Ícone</label>
                <input
                  type="text"
                  value={form.icone}
                  onChange={(e) => setForm({ ...form, icone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="/icon-192x192.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Destino</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="/tarot"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Público</label>
                  <select
                    value={form.publico}
                    onChange={(e) => setForm({ ...form, publico: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="todos">Todos os usuários</option>
                    <option value="ativos">Usuários ativos</option>
                    <option value="inativos">Usuários inativos</option>
                    <option value="premium">Usuários premium</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dispositivo</label>
                  <select
                    value={form.dispositivo}
                    onChange={(e) => setForm({ ...form, dispositivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="agendada">Agendada</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNotification}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 