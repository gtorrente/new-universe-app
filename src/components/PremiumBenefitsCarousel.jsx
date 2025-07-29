import { useState, useRef, useEffect } from 'react';
import { 
  FaVideo, 
  FaGift, 
  FaStar, 
  FaCoins, 
  FaCrown,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

// Dados estruturados dos benefícios premium
const benefitsData = [
  {
    id: 1,
    icon: <FaVideo className="text-2xl text-red-500" />,
    emoji: "🎬",
    title: "Receitas em Vídeo",
    description: "Aprenda com a Cátia através de vídeos exclusivos e detalhados",
    gradient: "from-red-50 to-pink-50",
    iconBg: "bg-red-100"
  },
  {
    id: 2,
    icon: <FaGift className="text-2xl text-green-500" />,
    emoji: "🎁",
    title: "Descontos Exclusivos",
    description: "Presentes especiais e descontos em produtos selecionados",
    gradient: "from-green-50 to-emerald-50",
    iconBg: "bg-green-100"
  },
  {
    id: 3,
    icon: <FaStar className="text-2xl text-purple-500" />,
    emoji: "⭐",
    title: "Mapa Astral Completo",
    description: "Análise detalhada da sua personalidade e futuro",
    gradient: "from-purple-50 to-violet-50",
    iconBg: "bg-purple-100"
  },
  {
    id: 4,
    icon: <FaCoins className="text-2xl text-yellow-500" />,
    emoji: "💰",
    title: "30 Créditos Mensais",
    description: "Créditos ilimitados para tarot, IA e consultas premium",
    gradient: "from-yellow-50 to-orange-50",
    iconBg: "bg-yellow-100"
  },
  {
    id: 5,
    icon: <FaCrown className="text-2xl text-indigo-500" />,
    emoji: "👑",
    title: "Seja Premium",
    description: "Desbloqueie todos os benefícios por apenas R$ 19,90/mês",
    gradient: "from-indigo-50 to-blue-50",
    iconBg: "bg-indigo-100",
    isAction: true
  }
];

const PremiumBenefitCard = ({ benefit, onClick }) => {
  return (
    <div
      className={`
        flex-shrink-0 w-64 h-32 rounded-2xl p-4 cursor-pointer
        bg-gradient-to-r ${benefit.gradient} 
        border border-gray-100 shadow-sm
        ${benefit.isAction ? 'ring-2 ring-purple-200' : ''}
        transition-all duration-200 hover:shadow-md hover:scale-102
      `}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Ícone/Emoji no topo */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`
            w-10 h-10 rounded-full ${benefit.iconBg} 
            flex items-center justify-center
          `}>
            {benefit.icon}
          </div>
          <span className="text-2xl">{benefit.emoji}</span>
        </div>
        
        {/* Título */}
        <h3 className={`
          font-bold text-sm mb-1
          ${benefit.isAction ? 'text-purple-700' : 'text-gray-800'}
        `}>
          {benefit.title}
        </h3>
        
        {/* Descrição */}
        <p className={`
          text-xs leading-relaxed flex-1
          ${benefit.isAction ? 'text-purple-600' : 'text-gray-600'}
        `}>
          {benefit.description}
        </p>
        
        {/* Indicador de ação para o card final */}
        {benefit.isAction && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold text-purple-700">
              Assinar agora
            </span>
            <FaChevronRight className="text-purple-500 text-xs" />
          </div>
        )}
      </div>
    </div>
  );
};

const PremiumBenefitsCarousel = ({ onSubscribeClick }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  // Atualizar visibilidade das setas baseado na posição do scroll
  const updateArrowVisibility = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < maxScroll - 10);
  };

  // Scroll para a esquerda
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 280; // largura do card + gap
    container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  // Scroll para a direita
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 280;
    container.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  // Handle card click
  const handleCardClick = (benefit) => {
    if (benefit.isAction && onSubscribeClick) {
      onSubscribeClick();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateArrowVisibility);
      updateArrowVisibility(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', updateArrowVisibility);
      };
    }
  }, []);

  return (
    <div className="relative">
      {/* Título da seção */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          ✨ Benefícios Premium
        </h2>
        <p className="text-sm text-gray-600">
          Desbloqueie uma experiência completa
        </p>
      </div>

      {/* Container do carrossel */}
      <div className="relative">
        {/* Seta esquerda */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                     w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200
                     flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FaChevronLeft className="text-gray-600 text-sm" />
          </button>
        )}

        {/* Seta direita */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                     w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200
                     flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FaChevronRight className="text-gray-600 text-sm" />
          </button>
        )}

        {/* Carrossel scrollável */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2"
          style={{ 
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {benefitsData.map((benefit) => (
            <div
              key={benefit.id}
              style={{ scrollSnapAlign: 'start' }}
            >
              <PremiumBenefitCard
                benefit={benefit}
                onClick={() => handleCardClick(benefit)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumBenefitsCarousel; 