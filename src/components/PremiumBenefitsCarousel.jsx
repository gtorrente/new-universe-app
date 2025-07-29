import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Dados estruturados dos benefícios premium com design aprimorado
const premiumBenefitsData = [
  {
    id: 1,
    image: "🌟",
    title: "Mapa Astral Completo",
    description: "Análise detalhada da sua personalidade e futuro",
    emotionalPhrase: "Descubra quem você realmente é",
    buttonText: "Quero descobrir",
    gradient: "from-purple-500 to-purple-700",
    bgGradient: "from-purple-50 to-purple-100",
    imageGradient: "from-purple-200 to-purple-300"
  },
  {
    id: 2,
    image: "💎",
    title: "30 Créditos Mensais",
    description: "Use como quiser no tarot, nas previsões e nas conversas com a IA",
    emotionalPhrase: "Liberdade total para explorar",
    buttonText: "Quero isso",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-100",
    imageGradient: "from-yellow-200 to-orange-300"
  },
  {
    id: 3,
    image: "🎬",
    title: "Receitas em Vídeo",
    description: "Cátia te ensinando receitas deliciosas e práticas",
    emotionalPhrase: "Aprenda com quem entende",
    buttonText: "Ver receitas",
    gradient: "from-red-500 to-pink-500",
    bgGradient: "from-red-50 to-pink-100",
    imageGradient: "from-red-200 to-pink-300"
  },
  {
    id: 4,
    image: "🎁",
    title: "Descontos & Presentes",
    description: "Ganhe mimos cósmicos e cupons exclusivos como assinante",
    emotionalPhrase: "Surpresas especiais só para você",
    buttonText: "Quero mimos",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-100",
    imageGradient: "from-green-200 to-emerald-300"
  },
  {
    id: 5,
    image: "✨",
    title: "Ser Premium",
    description: "Desbloqueie o Universo completo — sem limites, só magia",
    emotionalPhrase: "Transforme sua jornada cósmica",
    buttonText: "Assinar agora",
    gradient: "from-indigo-600 to-purple-600",
    bgGradient: "from-indigo-50 to-purple-100",
    imageGradient: "from-indigo-200 to-purple-300",
    isSpecial: true
  }
];

const PremiumBenefitCard = ({ benefit, onClick, isVisible }) => {
  return (
    <div
      className={`
        flex-shrink-0 w-72 h-80 rounded-3xl overflow-hidden
        bg-gradient-to-br ${benefit.bgGradient}
        border border-white/50 shadow-xl hover:shadow-2xl
        transition-all duration-300 cursor-pointer transform
        ${isVisible ? 'hover:scale-105' : ''}
        ${benefit.isSpecial ? 'ring-2 ring-purple-300 ring-opacity-50' : ''}
      `}
      onClick={onClick}
    >
      {/* Header com imagem de fundo */}
      <div className={`
        relative h-40 bg-gradient-to-br ${benefit.imageGradient}
        flex items-center justify-center overflow-hidden
      `}>
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/20"></div>
          <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white/15"></div>
          <div className="absolute top-12 right-8 w-8 h-8 rounded-full bg-white/10"></div>
        </div>
        
        {/* Emoji principal */}
        <div className="text-6xl z-10 transform hover:scale-110 transition-transform">
          {benefit.image}
        </div>
        
        {/* Badge especial para o card premium */}
        {benefit.isSpecial && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs font-bold text-purple-600">POPULAR</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6 h-40 flex flex-col justify-between">
        {/* Título e descrição */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">
            {benefit.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {benefit.description}
          </p>
          <p className="text-xs font-medium text-gray-500 italic">
            {benefit.emotionalPhrase}
          </p>
        </div>

        {/* Botão de ação */}
        <button
          className={`
            w-full py-3 rounded-2xl font-bold text-sm text-white
            bg-gradient-to-r ${benefit.gradient}
            hover:shadow-lg hover:scale-[1.02]
            active:scale-[0.98] transition-all duration-200
            ${benefit.isSpecial ? 'shadow-lg shadow-purple-500/25' : ''}
          `}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {benefit.buttonText}
        </button>
      </div>
    </div>
  );
};

const PremiumBenefitsCarousel = ({ onSubscribeClick }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [visibleCards, setVisibleCards] = useState(new Set([0, 1, 2]));
  const scrollContainerRef = useRef(null);

  // Atualizar visibilidade das setas e cards visíveis
  const updateVisibility = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < maxScroll - 20);

    // Calcular quais cards estão visíveis
    const cardWidth = 288; // w-72 = 288px
    const containerWidth = container.clientWidth;
    const firstVisibleIndex = Math.floor(scrollLeft / cardWidth);
    const visibleCount = Math.ceil(containerWidth / cardWidth) + 1;
    
    const visible = new Set();
    for (let i = firstVisibleIndex; i < firstVisibleIndex + visibleCount && i < premiumBenefitsData.length; i++) {
      visible.add(i);
    }
    setVisibleCards(visible);
  };

  // Scroll suave para a esquerda
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 288 + 16; // largura do card + gap
    container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  // Scroll suave para a direita
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 288 + 16;
    container.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  // Handle card click
  const handleCardClick = (benefit) => {
    if (benefit.isSpecial && onSubscribeClick) {
      onSubscribeClick();
    } else if (onSubscribeClick) {
      // Para outros cards, também pode abrir o modal premium
      onSubscribeClick();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        requestAnimationFrame(updateVisibility);
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      updateVisibility(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div className="relative">
      {/* Header da seção */}
      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ✨ Benefícios Premium
        </h2>
        <p className="text-gray-600">
          Desbloqueie uma experiência completa e transformadora
        </p>
      </div>

      {/* Container do carrossel */}
      <div className="relative">
        {/* Seta esquerda */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                     w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100
                     flex items-center justify-center hover:bg-gray-50 
                     hover:scale-110 transition-all duration-200"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
        )}

        {/* Seta direita */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                     w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100
                     flex items-center justify-center hover:bg-gray-50
                     hover:scale-110 transition-all duration-200"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        )}

        {/* Carrossel scrollável */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 py-4"
          style={{ 
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {premiumBenefitsData.map((benefit, index) => (
            <div
              key={benefit.id}
              style={{ scrollSnapAlign: 'start' }}
            >
              <PremiumBenefitCard
                benefit={benefit}
                onClick={() => handleCardClick(benefit)}
                isVisible={visibleCards.has(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de progresso */}
      <div className="flex justify-center mt-6 gap-2">
        {premiumBenefitsData.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              visibleCards.has(index) 
                ? 'w-8 bg-purple-400' 
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PremiumBenefitsCarousel; 