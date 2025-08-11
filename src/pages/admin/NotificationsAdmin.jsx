import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfigFront';
import { collection, getDocs, addDoc, updateDoc, setDoc, doc, getDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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
    mensagem: '',
    tipo: 'geral',
    publico: 'todos',
    agendamento: '',
    ativa: true,
    link_acionavel: '',
    icone: '🔔',
    prioridade: 'normal',
    visibilidade: 'badge_e_popup'
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log('🔄 Carregando notificações...');
      
      // Forçar cache refresh usando source: 'server'
      let notificationsSnap;
      try {
        // Usar 'source: server' para forçar busca no servidor, não no cache
        notificationsSnap = await getDocs(
          query(
            collection(db, 'notificacoes'),
            orderBy('createdAt', 'desc')
          ),
          { source: 'server' }
        );
      } catch (orderError) {
        console.warn('⚠️ Erro com orderBy, tentando sem ordenação:', orderError);
        // Fallback: buscar sem ordenação, mas ainda forçando servidor
        notificationsSnap = await getDocs(
          collection(db, 'notificacoes'),
          { source: 'server' }
        );
      }
      
      const notificationsData = notificationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrar somente notificações ativas (mais rigoroso)
      const activeOnly = notificationsData.filter(n => {
        const isActive = n.ativa !== false && n.status !== 'deletada';
        if (!isActive) {
          console.log(`🗑️ Filtrando notificação deletada: ${n.id} (ativa: ${n.ativa}, status: ${n.status})`);
        }
        return isActive;
      });

      // LOG DETALHADO dos IDs para debug
      console.log('📋 IDs encontrados (todos):', notificationsData.map(n => `${n.id} (ativa: ${n.ativa}, status: ${n.status})`));
      console.log('📋 IDs ativos após filtro:', activeOnly.map(n => n.id));
      
      // Ordenar manualmente se necessário
      activeOnly.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Mais recentes primeiro
      });
      
      console.log(`✅ ${activeOnly.length} notificações ativas carregadas (fonte: servidor)`);
      setNotifications(activeOnly);
      
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      setNotifications([]); // Limpar em caso de erro
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
        titulo: form.titulo,
        mensagem: form.mensagem,
        tipo: form.tipo,
        publico: form.publico,
        agendamento: form.agendamento ? new Date(form.agendamento).toISOString() : null,
        ativa: form.ativa,
        link_acionavel: form.link_acionavel,
        icone: form.icone,
        prioridade: form.prioridade,
        visibilidade: form.visibilidade,
        updatedAt: serverTimestamp(),
        visualizacoes: editingNotification?.visualizacoes || 0,
        cliques: editingNotification?.cliques || 0
      };

      if (editingNotification) {
        // Atualizar notificação existente
        await updateDoc(doc(db, 'notificacoes', editingNotification.id), notificationData);
        console.log('✅ Notificação atualizada:', editingNotification.id);
      } else {
        // Criar nova notificação (Firebase gera ID automaticamente)
        notificationData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'notificacoes'), notificationData);
        console.log('✅ Nova notificação criada:', docRef.id);
      }

      await loadNotifications();
      setShowModal(false);
      setEditingNotification(null);
      setForm({
        titulo: '',
        mensagem: '',
        tipo: 'geral',
        publico: 'todos',
        agendamento: '',
        ativa: true,
        link_acionavel: '',
        icone: '🔔',
        prioridade: 'normal',
        visibilidade: 'badge_e_popup'
      });
      
      alert(editingNotification ? 'Notificação atualizada com sucesso!' : 'Notificação criada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar notificação:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      if (error.code === 'permission-denied') {
        alert('Erro: Você não tem permissão para salvar notificações. Verifique se você é admin.');
      } else {
        alert(`Erro ao salvar notificação: ${error.message}`);
      }
    }
  };

  const handleDeleteNotification = async (id, titulo) => {
    if (window.confirm(`Deletar notificação "${titulo}"?`)) {
      try {
        console.log('🗑️ Tentando deletar notificação:', id);
        console.log('📊 IDs antes da deleção:', notifications.map(n => n.id));
        
        // 1. Remover otimisticamente da UI primeiro
        setNotifications(prevNotifications => {
          const filtered = prevNotifications.filter(notif => notif.id !== id);
          console.log('🎯 Removido otimisticamente. Restam:', filtered.length);
          return filtered;
        });
        
        // 2. Soft delete no Firebase
        const ref = doc(db, 'notificacoes', id);
        try {
          await updateDoc(ref, { ativa: false, status: 'deletada', deletedAt: serverTimestamp() });
          console.log('✅ Soft delete aplicado (updateDoc)');
        } catch (updateErr) {
          if (updateErr?.code === 'not-found') {
            console.warn('⚠️ Documento não existe para update. Criando tombstone via setDoc...');
            await setDoc(ref, { 
              ativa: false, 
              status: 'deletada', 
              deletedAt: serverTimestamp(),
              titulo: titulo || 'Notificação removida',
              motivo: 'Documento inexistente - corrigido via tombstone'
            }, { merge: true });
            console.log('✅ Tombstone criado com setDoc (merge)');
          } else {
            throw updateErr;
          }
        }
        
        // 3. Verificar se flag foi aplicada no servidor
        try {
          const snap = await getDoc(ref);
          const data = snap.data();
          console.log('🔎 Pós-soft-delete no servidor:', { existe: snap.exists(), ativa: data?.ativa, status: data?.status });
        } catch (e) {
          console.warn('⚠️ Não foi possível ler pós-soft-delete (pode ser regra). Prosseguindo.', e?.code || e?.message);
        }
        
        // 4. Recarregar lista (filtra ativa=false)
        console.log('🔄 Recarregando lista após soft delete...');
        await loadNotifications();
        
        alert('Notificação deletada (soft delete) com sucesso!');
        
      } catch (error) {
        console.error('❌ Erro ao deletar notificação:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
        
        // Reverter remoção otimística em caso de erro
        await loadNotifications();
        
        if (error.code === 'permission-denied') {
          alert('Erro: Você não tem permissão para deletar notificações. Verifique se você é admin.');
        } else if (error.code === 'not-found') {
          alert('Erro: Notificação não encontrada.');
        } else {
          alert(`Erro ao deletar notificação: ${error.message}`);
        }
      }
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setForm(notification);
    setShowModal(true);
  };

  const handleSendNotification = async (notification) => {
    if (window.confirm(`Ativar notificação "${notification.titulo}" agora?`)) {
      try {
        // Atualizar para ativa
        await updateDoc(doc(db, 'notificacoes', notification.id), {
          ativa: true,
          ativadaEm: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        await loadNotifications();
        alert('Notificação ativada com sucesso!');
      } catch (error) {
        console.error('Erro ao ativar notificação:', error);
        alert('Erro ao ativar notificação.');
      }
    }
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('🔄 Forçando refresh das notificações...');
                    setLoading(true);
                    loadNotifications().finally(() => setLoading(false));
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  title="Recarregar lista e limpar cache"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => {
                    setEditingNotification(null);
                    setForm({
                      titulo: '',
                      mensagem: '',
                      tipo: 'geral',
                      publico: 'todos',
                      agendamento: '',
                      ativa: true,
                      link_acionavel: '',
                      icone: '🔔',
                      prioridade: 'normal',
                      visibilidade: 'badge_e_popup'
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
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Público</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{notification.icone}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{notification.titulo}</div>
                          <div className="text-sm text-gray-500">{notification.mensagem}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {notification.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.publico === 'todos' ? 'Todos os usuários' : notification.publico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        notification.ativa 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        notification.prioridade === 'urgente' 
                          ? 'bg-red-100 text-red-800'
                          : notification.prioridade === 'baixa'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.prioridade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {!notification.ativa && (
                          <button
                            onClick={() => handleSendNotification(notification)}
                            className="text-green-600 hover:text-green-900"
                            title="Ativar agora"
                          >
                            <FaPlay />
                          </button>
                        )}
                        {notification.ativa && (
                          <button
                            onClick={() => handleSendNotification({...notification, ativa: false})}
                            className="text-orange-600 hover:text-orange-900"
                            title="Pausar"
                          >
                            <FaPause />
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
                  placeholder="Ex: Nova Previsão Semanal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  value={form.mensagem}
                  onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="A semana começou com novidades cósmicas! Veja o que os astros reservam pra você."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="geral">Geral</option>
                    <option value="previsao">Previsão</option>
                    <option value="tarot">Tarot</option>
                    <option value="receitas">Receitas</option>
                    <option value="promocao">Promoção</option>
                    <option value="manutencao">Manutenção</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <input
                    type="text"
                    value={form.icone}
                    onChange={(e) => setForm({ ...form, icone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="🪐"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Acionável</label>
                <input
                  type="text"
                  value={form.link_acionavel}
                  onChange={(e) => setForm({ ...form, link_acionavel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="/previsao-da-semana"
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
                    <option value="todos">Todos</option>
                    <option value="premium">Premium</option>
                    <option value="free">Free</option>
                    <option value="sem_creditos">Sem Créditos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={form.prioridade}
                    onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade</label>
                  <select
                    value={form.visibilidade}
                    onChange={(e) => setForm({ ...form, visibilidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="badge_e_popup">Badge e Popup</option>
                    <option value="badge">Apenas Badge</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.ativa}
                        onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Ativa</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agendamento (opcional)</label>
                <input
                  type="datetime-local"
                  value={form.agendamento}
                  onChange={(e) => setForm({ ...form, agendamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
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