// Página de Histórico de Conversas com a CatIA
// Exibe todas as conversas salvas do usuário com design atualizado

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FaArrowLeft, FaComments, FaTrash, FaEye, FaSpinner, FaSearch, FaStar, FaBook, FaRobot, FaFilter } from 'react-icons/fa';
import { auth, db } from '../firebaseConfigFront';
import Header from '../components/Header';

export default function MinhasConversas() {
  const navigate = useNavigate();
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [filtroAtivo, setFiltroAtivo] = useState('Todas');

  // Buscar usuário e créditos
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Aqui você pode buscar créditos se necessário
        setCreditos(0); // Placeholder
      }
    });
    return () => unsubscribe();
  }, []);

  // Buscar todas as conversas do usuário (IA, Tarot, Diário)
  useEffect(() => {
    const buscarConversas = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const todasConversas = [];

        // 1. Buscar conversas de IA (CatIA)
        try {
          const qIA = query(
            collection(db, 'conversas_catia'),
            where('userId', '==', currentUser.uid)
          );
          
          const snapshotIA = await getDocs(qIA);
          const conversasIA = snapshotIA.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tipo: 'IA',
            dataFim: doc.data().dataFim?.toDate() || new Date(),
            dataInicio: doc.data().dataInicio?.toDate() || new Date()
          }));
          
          todasConversas.push(...conversasIA);
          console.log(`✅ Encontradas ${conversasIA.length} conversas de IA`);
        } catch (error) {
          console.error('❌ Erro ao buscar conversas de IA:', error);
        }

        // 2. Buscar leituras de Tarot
        try {
          const qTarot = query(
            collection(db, 'leituras_tarot'),
            where('userId', '==', currentUser.uid)
          );
          
          const snapshotTarot = await getDocs(qTarot);
          const leiturasTarot = snapshotTarot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              titulo: `Leitura de Tarot: ${data.carta}`,
              tipo: 'Tarot',
              descricao: data.pergunta || 'Pergunta sobre o futuro',
              dataFim: data.timestamp?.toDate() || new Date(),
              totalMensagens: 1,
              mensagens: [
                { autor: 'usuario', texto: data.pergunta },
                { autor: 'tarot', texto: `${data.carta}: ${data.resposta}` }
              ]
            };
          });
          
          todasConversas.push(...leiturasTarot);
          console.log(`✅ Encontradas ${leiturasTarot.length} leituras de Tarot`);
        } catch (error) {
          console.error('❌ Erro ao buscar leituras de Tarot:', error);
        }

        // 3. Buscar entradas do Diário
        try {
          const qDiario = query(
            collection(db, 'diario'),
            where('userId', '==', currentUser.uid)
          );
          
          const snapshotDiario = await getDocs(qDiario);
          const entradasDiario = snapshotDiario.docs.map(doc => {
            const data = doc.data();
            const dataFormatada = data.dataCreated?.toDate() || new Date();
            return {
              id: doc.id,
              titulo: `Diário - ${dataFormatada.toLocaleDateString('pt-BR')}`,
              tipo: 'Diário',
              descricao: data.texto.length > 100 ? `${data.texto.substring(0, 97)}...` : data.texto,
              dataFim: dataFormatada,
              totalMensagens: 1,
              mensagens: [
                { autor: 'usuario', texto: data.texto }
              ]
            };
          });
          
          todasConversas.push(...entradasDiario);
          console.log(`✅ Encontradas ${entradasDiario.length} entradas de Diário`);
        } catch (error) {
          console.error('❌ Erro ao buscar entradas do Diário:', error);
        }

        // Ordenar todas as conversas por data (mais recentes primeiro)
        todasConversas.sort((a, b) => new Date(b.dataFim) - new Date(a.dataFim));
        
        setConversas(todasConversas);
        console.log(`📊 Total de conversas encontradas: ${todasConversas.length}`);
        
      } catch (error) {
        console.error('❌ Erro geral ao buscar conversas:', error);
      } finally {
        setLoading(false);
      }
    };

    buscarConversas();
  }, []);

  // Filtrar conversas por busca e categoria
  const conversasFiltradas = conversas.filter(conversa => {
    // Filtro por busca
    const matchSearch = conversa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversa.descricao && conversa.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (conversa.mensagens && conversa.mensagens.some(msg => 
        msg.texto.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    // Filtro por categoria
    const matchCategory = filtroAtivo === 'Todas' || conversa.tipo === filtroAtivo;
    
    return matchSearch && matchCategory;
  });

  // Calcular estatísticas
  const estatisticas = {
    Diário: conversas.filter(c => c.tipo === 'Diário').length,
    Tarot: conversas.filter(c => c.tipo === 'Tarot').length,
    IA: conversas.filter(c => c.tipo === 'IA').length
  };

  // Opções de filtro
  const filtros = [
    { nome: 'Todas', icone: FaFilter, cor: 'purple' },
    { nome: 'Diário', icone: FaBook, cor: 'green' },
    { nome: 'Tarot', icone: FaStar, cor: 'yellow' },
    { nome: 'IA', icone: FaRobot, cor: 'blue' }
  ];

  // Deletar conversa
  const deletarConversa = async (conversaId) => {
    setDeleting(conversaId);
    
    try {
      // Encontrar a conversa para saber de qual coleção deletar
      const conversa = conversas.find(c => c.id === conversaId);
      if (!conversa) {
        throw new Error('Conversa não encontrada');
      }

      let colecao = '';
      switch (conversa.tipo) {
        case 'IA':
          colecao = 'conversas_catia';
          break;
        case 'Tarot':
          colecao = 'leituras_tarot';
          break;
        case 'Diário':
          colecao = 'diario';
          break;
        default:
          throw new Error('Tipo de conversa desconhecido');
      }

      await deleteDoc(doc(db, colecao, conversaId));
      setConversas(conversas.filter(c => c.id !== conversaId));
      console.log(`✅ ${conversa.tipo} deletado com sucesso!`);
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      alert('Erro ao deletar. Tente novamente.');
    } finally {
      setDeleting(null);
    }
  };

  // Formatar data de forma amigável
  const formatarData = (data) => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header user={user} creditos={creditos} />
        <div className="flex items-center justify-center pt-20">
          <div className="flex items-center gap-3 text-purple-600">
            <FaSpinner className="animate-spin" size={24} />
            <span className="text-lg">Carregando conversas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header user={user} creditos={creditos} />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header da página */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
          >
            <FaArrowLeft className="text-purple-600" size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">💬 Minhas Conversas</h1>
            <p className="text-gray-600">
              {conversas.length} {conversas.length === 1 ? 'conversa salva' : 'conversas salvas'}
            </p>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-600"
          />
        </div>

        {/* Filtros por categoria */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filtros.map((filtro) => {
            const Icone = filtro.icone;
            const isActive = filtroAtivo === filtro.nome;
            return (
              <button
                key={filtro.nome}
                onClick={() => setFiltroAtivo(filtro.nome)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  isActive 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                <Icone size={14} />
                <span className="font-medium">{filtro.nome}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de conversas */}
        {conversasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <FaComments size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa salva ainda'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente uma busca diferente' 
                : 'Comece uma conversa com a CatIA para ver seu histórico aqui!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/catia')}
                className="bg-purple-500 text-white px-6 py-3 rounded-2xl hover:bg-purple-600 transition"
              >
                Conversar com CatIA
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {conversasFiltradas.map(conversa => {
              const getIconeByTipo = (tipo) => {
                switch(tipo) {
                  case 'Tarot': return <FaStar className="text-purple-500" size={20} />;
                  case 'Diário': return <FaBook className="text-green-500" size={20} />;
                  case 'IA': return <FaRobot className="text-blue-500" size={20} />;
                  default: return <FaComments className="text-gray-500" size={20} />;
                }
              };

              const getCorByTipo = (tipo) => {
                switch(tipo) {
                  case 'Tarot': return 'text-purple-600';
                  case 'Diário': return 'text-green-600';
                  case 'IA': return 'text-blue-600';
                  default: return 'text-gray-600';
                }
              };

              return (
                <div key={conversa.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start gap-4">
                    {/* Ícone do tipo */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      {getIconeByTipo(conversa.tipo)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {conversa.titulo}
                        </h3>
                        <span className={`text-sm font-medium ${getCorByTipo(conversa.tipo)}`}>
                          {conversa.tipo}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {conversa.descricao || conversa.mensagens?.[0]?.texto || 'Conversa sem descrição'}
                      </p>

                      {conversa.status && (
                        <p className="text-gray-400 text-xs italic mb-3">
                          📝 {conversa.status}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>📅 {formatarData(conversa.dataFim)}</span>
                        
                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedConversation(conversa)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Ver conversa"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => deletarConversa(conversa.id)}
                            disabled={deleting === conversa.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title={`Deletar ${conversa.tipo.toLowerCase()}`}
                          >
                            {deleting === conversa.id ? (
                              <FaSpinner className="animate-spin" size={14} />
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estatísticas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">{estatisticas.Diário}</div>
              <div className="text-sm text-gray-600">Diário</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">{estatisticas.Tarot}</div>
              <div className="text-sm text-gray-600">Tarot</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">{estatisticas.IA}</div>
              <div className="text-sm text-gray-600">IA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver conversa completa */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header do modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedConversation.titulo}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatarData(selectedConversation.dataFim)} • {selectedConversation.totalMensagens} mensagens
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Conteúdo da conversa */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {selectedConversation.mensagens && selectedConversation.mensagens.length > 0 ? (
                  selectedConversation.mensagens.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        msg.autor === 'usuario' 
                          ? 'bg-blue-500 text-white' 
                          : selectedConversation.tipo === 'Tarot' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : selectedConversation.tipo === 'Diário' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.texto}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer do modal */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedConversation(null)}
                className="w-full bg-purple-500 text-white py-3 rounded-2xl hover:bg-purple-600 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}