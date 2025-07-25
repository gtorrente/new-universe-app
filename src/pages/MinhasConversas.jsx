import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfigFront';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  FaArrowLeft, 
  FaComments, 
  FaBook, 
  FaStar, 
  FaRobot,
  FaCalendar,
  FaTrash,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import { PageLoading, CardLoading } from '../components/LoadingStates';

export default function MinhasConversas() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, diario, tarot, ai_requests
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadConversations(firebaseUser.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadConversations = async (userId) => {
    setLoading(true);
    
    try {
      const allConversations = [];

      // Carregar entradas do diário
      const diarioSnapshot = await getDocs(
        query(
          collection(db, 'diario'),
          where('userId', '==', userId)
        )
      );

      diarioSnapshot.docs.forEach(doc => {
        const data = doc.data();
        allConversations.push({
          id: doc.id,
          type: 'diario',
          title: 'Entrada do Diário',
          content: data.texto || '',
          date: data.dataCreated?.toDate() || new Date(),
          icon: FaBook,
          color: 'bg-pink-500',
          lightColor: 'bg-pink-50',
          borderColor: 'border-pink-200'
        });
      });

      // Carregar leituras de tarot
      // Buscar todas as leituras e filtrar manualmente (para compatibilidade com dados antigos)
      const tarotAllSnapshot = await getDocs(collection(db, 'leituras_tarot'));
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        tarotAllSnapshot.docs.forEach(doc => {
          const data = doc.data();
          
          // Verifica se é do usuário atual (por userId ou por nome para dados antigos)
          const isUserDocument = 
            data.userId === userId || // Novos documentos com userId
            (data.nome === currentUser.displayName && data.nome); // Documentos antigos por nome
          
          if (isUserDocument) {
            allConversations.push({
              id: doc.id,
              type: 'tarot',
              title: 'Leitura de Tarot',
              content: data.pergunta || data.interpretation || 'Leitura de tarot realizada',
              date: data.timestamp?.toDate() || new Date(),
              icon: FaStar,
              color: 'bg-purple-500',
              lightColor: 'bg-purple-50',
              borderColor: 'border-purple-200',
              cards: data.cards || []
            });
          }
        });
      }

      // Carregar requests de IA
      const aiSnapshot = await getDocs(
        query(
          collection(db, 'ai_requests'),
          where('userId', '==', userId)
        )
      );

      aiSnapshot.docs.forEach(doc => {
        const data = doc.data();
        allConversations.push({
          id: doc.id,
          type: 'ai_requests',
          title: `IA - ${data.type || 'Conversa'}`,
          content: data.metadata?.question || data.metadata?.input || 'Interação com IA',
          date: data.timestamp?.toDate() || new Date(),
          icon: FaRobot,
          color: 'bg-indigo-500',
          lightColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200'
        });
      });

      // Ordenar por data mais recente
      allConversations.sort((a, b) => b.date - a.date);
      setConversations(allConversations);

    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'all' || conv.type === filter;
    const matchesSearch = searchTerm === '' || 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeLabel = (type) => {
    switch (type) {
      case 'diario': return 'Diário';
      case 'tarot': return 'Tarot';
      case 'ai_requests': return 'IA';
      default: return type;
    }
  };

  if (loading) {
    return <PageLoading message="Carregando suas conversas..." />;
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
            <h1 className="text-xl font-semibold text-gray-800">Minhas Conversas</h1>
            <p className="text-sm text-gray-500">
              {filteredConversations.length} conversas encontradas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Barra de busca e filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 mb-6">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter className="inline mr-1" size={12} />
              Todas
            </button>
            <button
              onClick={() => setFilter('diario')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === 'diario' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaBook className="inline mr-1" size={12} />
              Diário
            </button>
            <button
              onClick={() => setFilter('tarot')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === 'tarot' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaStar className="inline mr-1" size={12} />
              Tarot
            </button>
            <button
              onClick={() => setFilter('ai_requests')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === 'ai_requests' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaRobot className="inline mr-1" size={12} />
              IA
            </button>
          </div>
        </div>

        {/* Lista de conversas */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8 text-center">
            <FaComments size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Tente buscar por outros termos' 
                : 'Comece interagindo com a Catia para ver suas conversas aqui'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/')}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
              >
                Começar conversa
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => {
              const IconComponent = conversation.icon;
              return (
                <div
                  key={`${conversation.type}-${conversation.id}`}
                  className={`bg-white rounded-2xl shadow-sm border ${conversation.borderColor} p-4 transition ${
                    conversation.type === 'tarot' 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => {
                    // Desabilitar clique em leituras de tarot por enquanto
                    if (conversation.type === 'tarot') {
                      return;
                    }
                    
                    // Navegar para a página específica baseada no tipo
                    if (conversation.type === 'diario') {
                      navigate('/diario');
                    } else {
                      navigate('/');
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${conversation.lightColor} rounded-lg`}>
                      <IconComponent size={20} className={`${conversation.color.replace('bg-', 'text-')}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-800 truncate">
                          {conversation.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${conversation.lightColor} ${conversation.color.replace('bg-', 'text-')}`}>
                          {getTypeLabel(conversation.type)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {conversation.content}
                      </p>
                      
                      {conversation.type === 'tarot' && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 italic">
                            📖 Visualização detalhada em breve
                          </span>
                        </div>
                      )}
                      
                      {conversation.cards && conversation.cards.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {conversation.cards.slice(0, 3).map((card, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                              {card.name}
                            </span>
                          ))}
                          {conversation.cards.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{conversation.cards.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCalendar size={12} />
                        <span>{formatDate(conversation.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estatísticas */}
        {filteredConversations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Estatísticas</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-pink-600">
                  {conversations.filter(c => c.type === 'diario').length}
                </div>
                <div className="text-xs text-gray-500">Diário</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {conversations.filter(c => c.type === 'tarot').length}
                </div>
                <div className="text-xs text-gray-500">Tarot</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-600">
                  {conversations.filter(c => c.type === 'ai_requests').length}
                </div>
                <div className="text-xs text-gray-500">IA</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 