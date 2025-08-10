// Hook para gerenciar notificações
// Busca notificações ativas, controla visualizações e badge

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebaseConfigFront';

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [novasNotificacoes, setNovasNotificacoes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Monitorar usuário autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Buscar notificações ativas
  const buscarNotificacoes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔔 Buscando notificações para:', user.uid);
      
      const q = query(
        collection(db, 'notificacoes'),
        where('ativa', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const notificacoesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrar notificações por público-alvo
      const notificacoesFiltradas = notificacoesData.filter(notif => {
        // Se é para todos, sempre mostrar
        if (notif.publico === 'todos') return true;
        
        // TODO: Implementar lógica de filtro por tipo de usuário
        // Por enquanto, mostrar para todos
        return true;
      });

      // Filtrar por agendamento (apenas notificações agendadas para agora ou passado)
      const agora = new Date();
      const notificacoesAtivas = notificacoesFiltradas.filter(notif => {
        if (!notif.agendamento) return true; // Sem agendamento = ativa
        
        const dataAgendamento = new Date(notif.agendamento);
        return dataAgendamento <= agora; // Apenas se já passou do horário agendado
      });

              // Ordenar por data (mais recentes primeiro) no JavaScript
        notificacoesAtivas.sort((a, b) => {
          const dataA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dataB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dataB - dataA;
        });
        
        setNotificacoes(notificacoesAtivas);
        
        // Calcular notificações não visualizadas pelo usuário
        // Por simplicidade, vamos usar localStorage para tracking
        const visualizadas = JSON.parse(localStorage.getItem(`notif_vistas_${user.uid}`) || '[]');
        const naoVisualizadas = notificacoesAtivas.filter(notif => 
          !visualizadas.includes(notif.id)
        );
        
        setNovasNotificacoes(naoVisualizadas.length);
      
      console.log(`📊 Encontradas ${notificacoesAtivas.length} notificações, ${naoVisualizadas.length} novas`);
      
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Marcar notificação como visualizada
  const marcarComoVista = useCallback(async (notificacaoId) => {
    if (!user) return;
    
    try {
      // Atualizar localStorage
      const visualizadas = JSON.parse(localStorage.getItem(`notif_vistas_${user.uid}`) || '[]');
      if (!visualizadas.includes(notificacaoId)) {
        visualizadas.push(notificacaoId);
        localStorage.setItem(`notif_vistas_${user.uid}`, JSON.stringify(visualizadas));
        
        // Atualizar contador
        setNovasNotificacoes(prev => Math.max(0, prev - 1));
        
        // Incrementar contador de visualizações no Firebase
        const notifRef = doc(db, 'notificacoes', notificacaoId);
        await updateDoc(notifRef, {
          visualizacoes: (notificacoes.find(n => n.id === notificacaoId)?.visualizacoes || 0) + 1
        });
        
        console.log('✅ Notificação marcada como vista:', notificacaoId);
      }
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como vista:', error);
    }
  }, [user, notificacoes]);

  // Marcar todas como vistas
  const marcarTodasComoVistas = useCallback(async () => {
    if (!user || notificacoes.length === 0) return;
    
    try {
      const visualizadas = JSON.parse(localStorage.getItem(`notif_vistas_${user.uid}`) || '[]');
      const novasIds = notificacoes
        .filter(notif => !visualizadas.includes(notif.id))
        .map(notif => notif.id);
      
      if (novasIds.length > 0) {
        // Atualizar localStorage
        const todasVisualizadas = [...visualizadas, ...novasIds];
        localStorage.setItem(`notif_vistas_${user.uid}`, JSON.stringify(todasVisualizadas));
        
        // Zerar contador
        setNovasNotificacoes(0);
        
        console.log(`✅ ${novasIds.length} notificações marcadas como vistas`);
      }
    } catch (error) {
      console.error('❌ Erro ao marcar todas como vistas:', error);
    }
  }, [user, notificacoes]);

  // Buscar notificações quando usuário muda
  useEffect(() => {
    if (user) {
      buscarNotificacoes();
      
      // Atualizar a cada 5 minutos
      const interval = setInterval(buscarNotificacoes, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setNotificacoes([]);
      setNovasNotificacoes(0);
      setLoading(false);
    }
  }, [user, buscarNotificacoes]);

  return {
    notificacoes,
    novasNotificacoes,
    loading,
    marcarComoVista,
    marcarTodasComoVistas,
    refresh: buscarNotificacoes
  };
}