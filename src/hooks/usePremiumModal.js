import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfigFront';

export const usePremiumModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Verificar se é a primeira vez do usuário
        const hasSeenPremiumModal = localStorage.getItem(`premiumModal_${firebaseUser.uid}`);
        
        if (!hasSeenPremiumModal) {
          // Mostrar modal após 2 segundos para melhor UX
          setTimeout(() => {
            setShowModal(true);
          }, 2000);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    if (user) {
      // Marcar que o usuário já viu o modal
      localStorage.setItem(`premiumModal_${user.uid}`, 'true');
    }
  };

  const handleSubscribe = (planType) => {
    console.log('Usuário quer assinar:', planType);
    // Aqui você pode integrar com o sistema de pagamento
    // Por exemplo: Stripe, Mercado Pago, etc.
    
    // Por enquanto, apenas fechar o modal
    handleCloseModal();
    
    // Você pode retornar os dados do plano para processamento
    return { planType, userId: user?.uid };
  };

  return {
    showModal,
    user,
    handleCloseModal,
    handleSubscribe
  };
}; 