import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaTimes, 
  FaInfinity, 
  FaGem, 
  FaUtensils, 
  FaComments, 
  FaGift,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import LogoUniversoCatia from "../assets/logo-purple-universo-catia.png";

const PremiumModal = ({ isOpen, onClose, onSubscribe }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('annual'); // Plano padrão é anual

  // Controlar overflow do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll da página quando modal estiver aberto
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restaurar scroll quando modal fechar
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    // Cleanup no unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Vantagens do plano premium
  const vantagens = [
    {
      icon: FaInfinity,
      titulo: "Mapas Astrais Ilimitados",
      descricao: "Crie quantos mapas quiser para você e sua família",
      cor: "from-purple-500 to-blue-500"
    },
    {
      icon: FaGem,
      titulo: "Leituras Avançadas de Tarot",
      descricao: "Interpretações profundas com múltiplas cartas",
      cor: "from-pink-500 to-purple-500"
    },
    {
      icon: FaUtensils,
      titulo: "Biblioteca Completa de Receitas",
      descricao: "Acesso a todas as receitas místicas e culinárias",
      cor: "from-green-500 to-teal-500"
    },
    {
      icon: FaComments,
      titulo: "Chat Ilimitado com CatIA",
      descricao: "Conversas sem limite para todos os seus questionamentos",
      cor: "from-blue-500 to-indigo-500"
    },
    {
      icon: FaGift,
      titulo: "Bônus Exclusivos",
      descricao: "Conteúdos especiais e acesso antecipado a novidades",
      cor: "from-orange-500 to-red-500"
    }
  ];

  // Auto-play do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % vantagens.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [vantagens.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % vantagens.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + vantagens.length) % vantagens.length);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 z-[9999]"
        style={{ 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          minWidth: '100vw',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(1px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          style={{
            position: 'relative',
            margin: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-4 text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={18} />
            </button>
            
            {/* Imagem/Ilustração */}
            <div className="mb-3">
              <div className="flex items-center justify-center mb-2">
                <img src={LogoUniversoCatia} alt="Logo Universo Catia" className="w-20 h-20" />
              </div>
            </div>

            {/* Título e Subtítulo */}
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Desbloqueie a sua <span className="text-purple-600">experiência completa</span>
            </h2>
            <p className="text-gray-600 text-xs">
              Acesse recursos premium e transforme sua jornada com a Catia
            </p>
          </div>

          {/* Carrossel de Vantagens */}
          <div className="px-4 py-2">
            <div className="relative h-20 mb-3">
              <div className="overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {vantagens.map((vantagem, index) => {
                    const IconComponent = vantagem.icon;
                    return (
                      <div
                        key={index}
                        className="w-full flex-shrink-0 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 bg-gradient-to-br ${vantagem.cor} rounded-lg flex items-center justify-center`}>
                            <IconComponent size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-xs mb-1">
                              {vantagem.titulo}
                            </h3>
                            <p className="text-gray-600 text-xs leading-tight">
                              {vantagem.descricao}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controles do carrossel */}
              <button
                onClick={prevSlide}
                className="absolute left-1 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
              >
                <FaChevronLeft size={10} className="text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
              >
                <FaChevronRight size={10} className="text-gray-600" />
              </button>
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-1 mb-3">
              {vantagens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    index === currentSlide ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Planos de Preço */}
          <div className="px-4 mb-4">
            <div className="grid grid-cols-2 gap-2">
              {/* Plano Mensal */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`border-2 rounded-xl p-3 text-center transition-all ${
                  selectedPlan === 'monthly' 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`text-xs font-semibold py-1 px-2 rounded-full mb-2 inline-block ${
                  selectedPlan === 'monthly'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  MENSAL
                </div>
                <div className={`text-xl font-bold mb-1 ${
                  selectedPlan === 'monthly' ? 'text-purple-600' : 'text-gray-800'
                }`}>
                  R$ 12,90
                </div>
                <div className="text-xs text-gray-500">por mês</div>
              </button>

              {/* Plano Anual (Destacado) */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`border-2 rounded-xl p-3 text-center relative transition-all ${
                  selectedPlan === 'annual'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="bg-blue-500 text-white text-xs font-semibold py-1 px-2 rounded-full mb-2 inline-block">
                  ECONOMIZE 33%
                </div>
                <div className={`text-xl font-bold mb-1 ${
                  selectedPlan === 'annual' ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  R$ 99,90
                </div>
                <div className="text-xs text-gray-600">por ano</div>
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                  POPULAR
                </div>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="px-4 pb-4">
            <button
              onClick={() => onSubscribe(selectedPlan)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl mb-2 hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
            >
              {selectedPlan === 'monthly' ? 'Assinar Plano Mensal' : 'Assinar Plano Anual'}
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-500 font-medium py-2 hover:text-gray-700 transition"
            >
              Agora não
            </button>
          </div>

          {/* Rodapé com Avaliações */}
          <div className="px-4 pb-4 text-center border-t border-gray-100 pt-3">
            <div className="flex justify-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" size={12} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Avaliação 4.9/5 baseada em 1.200+ usuários
            </p>
            <div className="flex justify-center gap-3 text-xs text-gray-400">
              <span>Política de Privacidade</span>
              <span>•</span>
              <span>Termos de Uso</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumModal; 