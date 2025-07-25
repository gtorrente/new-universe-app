import { db } from '../firebaseConfigFront';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Registra um request de IA para analytics
 * @param {string} userId - ID do usuário
 * @param {string} type - Tipo de request (tarot, chat, previsao, etc)
 * @param {Object} metadata - Dados adicionais (opcional)
 */
export const logAIRequest = async (userId, type, metadata = {}) => {
  try {
    await addDoc(collection(db, 'ai_requests'), {
      userId,
      type,
      timestamp: serverTimestamp(),
      metadata,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD para facilitar consultas
    });
    
    console.log(`🤖 AI Request logged: ${type} by ${userId}`);
  } catch (error) {
    console.error('Erro ao registrar request de IA:', error);
  }
};

/**
 * Tipos de requests de IA disponíveis
 */
export const AI_REQUEST_TYPES = {
  TAROT: 'tarot',
  CHAT: 'chat', 
  PREVISAO_SEMANAL: 'previsao_semanal',
  MAPA_ASTRAL: 'mapa_astral',
  RECEITA_SUGESTAO: 'receita_sugestao',
  DIARIO_ANALISE: 'diario_analise'
};

/**
 * Busca estatísticas de requests de IA
 */
export const getAIRequestStats = async () => {
  try {
    // Esta função será implementada quando necessário
    // Por enquanto retorna dados simulados
    return {
      total: 47,
      byType: {
        tarot: 25,
        chat: 15,
        previsao_semanal: 4,
        mapa_astral: 2,
        receita_sugestao: 1
      },
      byDate: {
        [new Date().toISOString().split('T')[0]]: 47
      }
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de IA:', error);
    return null;
  }
}; 