import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfigFront';

export const useEmailVerification = () => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setIsLoading(true);
      
      if (user) {
        // Sempre recarrega o usuário para ter o status mais atualizado
        try {
          await user.reload();
          const updatedUser = auth.currentUser;
          
          if (updatedUser?.emailVerified) {
            setIsAuthenticated(true);
            setShowVerificationModal(false);
          } else {
            setIsAuthenticated(false);
            setShowVerificationModal(true);
          }
        } catch (error) {
          console.error('Erro ao verificar status do usuário:', error);
          // Em caso de erro, assume que não está verificado
          setIsAuthenticated(false);
          setShowVerificationModal(true);
        }
      } else {
        // Usuário não logado
        setIsAuthenticated(false);
        setShowVerificationModal(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVerificationSuccess = () => {
    setIsAuthenticated(true);
    setShowVerificationModal(false);
  };

  const handleCloseModal = () => {
    // Não permite fechar o modal se não estiver verificado
    if (!currentUser?.emailVerified) {
      return;
    }
    setShowVerificationModal(false);
  };

  return {
    showVerificationModal,
    currentUser,
    isAuthenticated,
    isLoading,
    handleVerificationSuccess,
    handleCloseModal
  };
}; 