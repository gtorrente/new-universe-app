import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaCheckCircle, 
  FaSpinner, 
  FaArrowRight,
  FaTimes,
  FaRocket,
  FaSignOutAlt
} from 'react-icons/fa';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfigFront';

const EmailVerificationModal = ({ isOpen, user, onVerificationSuccess }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [autoCheckCount, setAutoCheckCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Auto-check a cada 5 segundos
  useEffect(() => {
    if (!isOpen || isVerified) return;

    const interval = setInterval(async () => {
      try {
        await user.reload();
        const updatedUser = auth.currentUser;
        if (updatedUser?.emailVerified) {
          setIsVerified(true);
          setAutoCheckCount(prev => prev + 1);
          // Aguarda um pouco antes de redirecionar para mostrar a animação
          setTimeout(() => {
            onVerificationSuccess();
          }, 2000);
        } else {
          setAutoCheckCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Erro ao verificar e-mail:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, user, isVerified, onVerificationSuccess]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      await user.reload();
      const updatedUser = auth.currentUser;
      if (updatedUser?.emailVerified) {
        setIsVerified(true);
        setTimeout(() => {
          onVerificationSuccess();
        }, 2000);
      } else {
        // Mostra feedback visual de que ainda não foi verificado
        setTimeout(() => {
          setIsChecking(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao reenviar e-mail:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O AuthGuard redirecionará automaticamente para login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-br from-purple-50 to-blue-50">
          {/* Botão de logout no canto superior direito */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-sm"
            title="Fazer logout"
          >
            <FaSignOutAlt size={16} />
          </button>
          
          {/* Ícone animado */}
          <motion.div 
            className="mb-4"
            animate={isVerified ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              {isVerified ? (
                <FaCheckCircle size={32} className="text-white" />
              ) : (
                <FaEnvelope size={32} className="text-white" />
              )}
            </div>
          </motion.div>

          {/* Título dinâmico */}
          <motion.h2 
            className="text-2xl font-bold text-gray-800 mb-2"
            animate={isVerified ? { color: "#059669" } : {}}
          >
            {isVerified ? (
              <>
                <span className="text-green-600">E-mail confirmado!</span>
              </>
            ) : (
              <>
                Quase lá... <span className="text-purple-600">Confirme seu e-mail</span>
              </>
            )}
          </motion.h2>

          {/* Subtítulo dinâmico */}
          <motion.p 
            className="text-gray-600 text-sm"
            animate={isVerified ? { color: "#059669" } : {}}
          >
            {isVerified 
              ? "Redirecionando para o app..." 
              : "Enviamos um link de confirmação para seu e-mail"
            }
          </motion.p>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {!isVerified ? (
            <>
              {/* E-mail do usuário */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">E-mail para confirmação:</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  📧 Verifique sua caixa de entrada e spam. Caso não encontre o e-mail, clique em "Reenviar e-mail".
                </p>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3">
                {/* Botão de verificação manual */}
                <button
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-4 rounded-2xl hover:from-purple-600 hover:to-blue-700 transition shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isChecking ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Já confirmei meu e-mail
                    </>
                  )}
                </button>

                {/* Botão de reenvio */}
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full border-2 border-purple-200 text-purple-600 font-semibold py-4 rounded-2xl hover:bg-purple-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      Reenviar e-mail
                    </>
                  )}
                </button>

                {/* Botão de logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-gray-500 font-medium py-3 hover:text-gray-700 transition flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt />
                  Sair e fazer login em outra conta
                </button>
              </div>

              {/* Feedback de reenvio */}
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-center"
                >
                  <p className="text-green-700 text-sm font-medium">
                    ✓ E-mail reenviado com sucesso!
                  </p>
                </motion.div>
              )}

              {/* Auto-check status */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Verificando automaticamente... ({autoCheckCount} tentativas)
                </p>
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-purple-300 rounded-full"
                        animate={{
                          scale: autoCheckCount % 3 === i ? [1, 1.5, 1] : 1
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tela de sucesso */
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="mb-4"
              >
                <FaRocket size={48} className="text-green-500 mx-auto" />
              </motion.div>
              <p className="text-green-600 font-semibold">
                Preparando sua experiência...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal; 