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
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-3xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={20} />
            </button>
            
            {/* Imagem/Ilustração */}
            <div className="mb-4">
              <div className="flex items-center justify-center mb-4">
                <img src={LogoUniversoCatia} alt="Logo Universo Catia" className="w-28 h-28" />
              </div>
            </div>

            {/* Título e Subtítulo */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Desbloqueie a sua <span className="text-purple-600">experiência completa</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Acesse recursos premium e transforme sua jornada com a Catia
            </p>
          </div>

          {/* Carrossel de Vantagens */}
          <div className="px-6 py-4">
            <div className="relative h-32 mb-4">
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {vantagens.map((vantagem, index) => {
                    const IconComponent = vantagem.icon;
                    return (
                      <div
                        key={index}
                        className="w-full flex-shrink-0 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${vantagem.cor} rounded-xl flex items-center justify-center`}>
                            <IconComponent size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">
                              {vantagem.titulo}
                            </h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
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
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
              >
                <FaChevronLeft size={12} className="text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
              >
                <FaChevronRight size={12} className="text-gray-600" />
              </button>
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mb-6">
              {vantagens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentSlide ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Planos de Preço */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {/* Plano Mensal */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`border-2 rounded-2xl p-4 text-center transition-all ${
                  selectedPlan === 'monthly' 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`text-xs font-semibold py-1 px-3 rounded-full mb-3 inline-block ${
                  selectedPlan === 'monthly'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  MENSAL
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  selectedPlan === 'monthly' ? 'text-purple-600' : 'text-gray-800'
                }`}>
                  R$ 12,90
                </div>
                <div className="text-xs text-gray-500">por mês</div>
              </button>

              {/* Plano Anual (Destacado) */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`border-2 rounded-2xl p-4 text-center relative transition-all ${
                  selectedPlan === 'annual'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="bg-blue-500 text-white text-xs font-semibold py-1 px-3 rounded-full mb-3 inline-block">
                  ECONOMIZE 33%
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  selectedPlan === 'annual' ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  R$ 99,90
                </div>
                <div className="text-xs text-gray-600">por ano</div>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                  POPULAR
                </div>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="px-6 pb-6">
            <button
              onClick={() => onSubscribe(selectedPlan)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl mb-3 hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
            >
              {selectedPlan === 'monthly' ? 'Assinar Plano Mensal' : 'Assinar Plano Anual'}
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-500 font-medium py-3 hover:text-gray-700 transition"
            >
              Agora não
            </button>
          </div>

          {/* Rodapé com Avaliações */}
          <div className="px-6 pb-6 text-center border-t border-gray-100 pt-4">
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" size={16} />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Avaliação 4.9/5 baseada em 1.200+ usuários
            </p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
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