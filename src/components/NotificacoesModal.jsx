// Modal para exibir notificações
// Mostra lista de notificações ativas com links acionáveis

import { useNavigate } from 'react-router-dom';
import { FaTimes, FaExternalLinkAlt, FaCheckDouble, FaTrash } from 'react-icons/fa';

export default function NotificacoesModal({ 
  isOpen, 
  onClose, 
  notificacoes, 
  onNotificacaoClick,
  onMarcarTodasVistas,
  onDeletarNotificacao
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificacaoClick = (notificacao) => {
    // Marcar como vista
    onNotificacaoClick(notificacao.id);
    
    // Navegar para o link se existir
    if (notificacao.link_acionavel) {
      navigate(notificacao.link_acionavel);
      onClose(); // Fechar modal após navegação
    }
  };

  const handleDeletarNotificacao = async (notificacaoId, event) => {
    event.stopPropagation(); // Evitar trigger do click da notificação
    
    try {
      await onDeletarNotificacao(notificacaoId);
    } catch (error) {
      alert('Erro ao deletar notificação. Você precisa de permissões de administrador.');
    }
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const agora = new Date();
    const diffMs = agora - data;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHoras < 1) return 'Agora';
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 7) return `${diffDias}d atrás`;
    
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getPrioridadeStyle = (prioridade) => {
    switch (prioridade) {
      case 'urgente':
        return 'border-l-red-500 bg-red-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'baixa':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🔔 Notificações</h2>
            <p className="text-sm text-gray-500">
              {notificacoes.length} {notificacoes.length === 1 ? 'notificação' : 'notificações'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notificacoes.length > 0 && (
              <button
                onClick={onMarcarTodasVistas}
                className="p-2 text-gray-500 hover:text-blue-600 transition"
                title="Marcar todas como lidas"
              >
                <FaCheckDouble size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Lista de notificações */}
        <div className="overflow-y-auto max-h-96">
          {notificacoes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-500 text-sm">
                Você está em dia! Não há notificações pendentes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`p-4 border-l-4 transition hover:bg-gray-50 cursor-pointer ${getPrioridadeStyle(notificacao.prioridade)}`}
                  onClick={() => handleNotificacaoClick(notificacao)}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone */}
                    <div className="flex-shrink-0 text-2xl">
                      {notificacao.icone || '🔔'}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                          {notificacao.titulo}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          {/* Botão de deletar */}
                          <button
                            onClick={(e) => handleDeletarNotificacao(notificacao.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                            title="Deletar notificação"
                          >
                            <FaTrash size={12} />
                          </button>
                          {notificacao.link_acionavel && (
                            <FaExternalLinkAlt size={12} className="text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatarData(notificacao.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notificacao.mensagem}
                      </p>
                      
                      {/* Badge do tipo */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          notificacao.tipo === 'urgente' 
                            ? 'bg-red-100 text-red-800'
                            : notificacao.tipo === 'promocao'
                            ? 'bg-green-100 text-green-800'
                            : notificacao.tipo === 'previsao'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notificacao.tipo}
                        </span>
                        
                        {notificacao.prioridade === 'urgente' && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notificacoes.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Toque em uma notificação para abrir o conteúdo relacionado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}