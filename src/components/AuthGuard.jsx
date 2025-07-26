import { useEmailVerification } from '../hooks/useEmailVerification';
import EmailVerificationModal from './EmailVerificationModal';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const {
    currentUser,
    isAuthenticated,
    isLoading,
    handleVerificationSuccess
  } = useEmailVerification();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // Usuário não logado - redireciona para login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Usuário logado mas não verificado - mostra APENAS tela de verificação
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50">
        <EmailVerificationModal
          isOpen={true}
          user={currentUser}
          onVerificationSuccess={handleVerificationSuccess}
        />
      </div>
    );
  }

  // Usuário autenticado e verificado - mostra o app normalmente
  return children;
};

export default AuthGuard; 