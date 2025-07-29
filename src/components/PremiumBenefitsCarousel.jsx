import { useRef, useEffect } from 'react';
import receitasCatiaImage from '../assets/receitas-catia-premium.jpg';
import thermaMixImage from '../assets/therma-mix-premium.jpeg';
import mapaAstralImage from '../assets/mapa-astral-premium2.png';
import creditosImage from '../assets/creditos-premium.png';

// Dados estruturados dos benefícios premium com imagens reais
const premiumBenefitsData = [
  {
    id: 1,
    image: receitasCatiaImage,
    title: "Receitas em Vídeo",
    description: "Aprenda com a Catia receitas fáceis e deliciosas para o dia a dia",
    buttonText: "Quero aprender",
    gradient: "from-red-500 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
    exclusiveTag: "ACESSO VIP"
  },
  {
    id: 2,
    image: thermaMixImage,
    title: "Descontos & Presentes",
    description: "Assinantes ganham surpresas, cupons e mimos com carinho",
    buttonText: "Quero meu presente",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    exclusiveTag: "SOMENTE ASSINANTES"
  },
  {
    id: 3,
    image: mapaAstralImage,
    title: "Mapa Astral Completo",
    description: "Análise profunda da sua personalidade e propósito de vida",
    buttonText: "Quero acessar",
    gradient: "from-purple-500 to-purple-700",
    bgGradient: "from-purple-50 to-purple-100",
    exclusiveTag: "ACESSO VIP"
  },
  {
    id: 4,
    image: creditosImage,
    title: "30 Créditos Mensais",
    description: "Use no tarot, previsões e conselhos da CatIA sem limitações",
    buttonText: "Quero obter",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-100",
    exclusiveTag: "BENEFÍCIO PREMIUM"
  }
];

const PremiumBenefitCard = ({ benefit, onClick }) => {
  return (
    <div
      className={`
        flex-shrink-0 w-72 h-96 bg-white rounded-3xl overflow-hidden
        shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
        transform hover:scale-[1.02] ${benefit.isSpecial ? 'ring-2 ring-purple-300' : ''}
        flex flex-col relative
      `}
      onClick={onClick}
    >
      {/* Tag de exclusividade */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`
          px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg
          ${benefit.isSpecial 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
            : 'bg-gradient-to-r from-gray-800 to-gray-900'
          }
        `}>
          {benefit.exclusiveTag}
        </div>
      </div>

      {/* Imagem no topo */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img
          src={benefit.image}
          alt={benefit.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay sutil para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Badge especial para o card premium - movido para baixo da tag */}
        {benefit.isSpecial && (
          <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            POPULAR
          </div>
        )}
      </div>

      {/* Conteúdo do card */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Título */}
          <h3 className="font-bold text-xl text-gray-800 mb-3 leading-tight">
            {benefit.title}
          </h3>
          
          {/* Descrição */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {benefit.description}
          </p>
        </div>

        {/* Botão de ação */}
        <button
          className={`
            w-full py-3 px-4 rounded-2xl font-bold text-sm text-white
            bg-gradient-to-r from-purple-500 to-purple-700
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200
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
  const scrollContainerRef = useRef(null);

  // Handle card click
  const handleCardClick = () => {
    if (onSubscribeClick) {
      onSubscribeClick();
    }
  };

  // Configurar scroll nativo e suave
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Detectar se é dispositivo móvel
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Para desktop: melhorar scroll com wheel
    const handleWheel = (e) => {
      // Só aplicar no desktop e se for scroll vertical
      if (!isMobile && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        
        // Scroll muito mais suave e gradual
        const scrollAmount = e.deltaY * 0.3; // Reduzido significativamente
        container.scrollBy({
          left: scrollAmount,
          behavior: 'auto' // Removido 'smooth' para evitar conflitos
        });
      }
    };

    // Apenas adicionar wheel listener para desktop
    if (!isMobile) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Configurar propriedades de scroll nativo para mobile
    if (isMobile) {
      // Aplicar CSS para scroll nativo otimizado
      container.style.scrollSnapType = 'x mandatory';
      container.style.WebkitOverflowScrolling = 'touch';
      container.style.overscrollBehaviorX = 'contain'; // Evita bounce excessivo
    }
    
    return () => {
      if (!isMobile) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* Header da seção com margem consistente */}
      <div className="px-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ✨ Benefícios Premium
        </h2>
        <p className="text-gray-600">
          Desbloqueie uma experiência completa e transformadora
        </p>
      </div>

      {/* Carrossel scrollável - otimizado para experiência nativa */}
      <div className="w-full">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-4 pl-4 pr-4"
          style={{ 
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            overscrollBehaviorX: 'contain', // Evita bounce lateral excessivo
            scrollPaddingLeft: '16px', // Padding para snap correto
            scrollBehavior: 'auto' // Comportamento nativo
          }}
        >
          {premiumBenefitsData.map((benefit, index) => (
            <div
              key={benefit.id}
              className="flex-shrink-0"
              style={{ 
                scrollSnapAlign: index === 0 ? 'start' : 'center', // Primeiro card alinha à esquerda
                scrollSnapStop: 'always' // Força parada em cada card
              }}
            >
              <PremiumBenefitCard
                benefit={benefit}
                onClick={handleCardClick}
              />
            </div>
          ))}
          
          {/* Espaçamento final para última card não ficar grudada */}
          <div 
            className="flex-shrink-0 w-4" 
            style={{ scrollSnapAlign: 'end' }}
          ></div>
        </div>
      </div>

      {/* CSS customizado para remover scrollbar completamente */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default PremiumBenefitsCarousel; 