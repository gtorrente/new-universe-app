import { motion } from 'framer-motion';
import LazyImage from './LazyImage';

const OptimizedTarotCard = ({ 
  card, 
  isSelected = false, 
  isRevealed = false, 
  onClick,
  className = "",
  priority = false 
}) => {
  // Placeholder animado para cartas
  const cardPlaceholder = (
    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center rounded-lg">
      <div className="text-center">
        {/* Símbolo místico animado */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto mb-2"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-purple-400">
            <path d="M12 2L13.09 8.26L17 6L14.74 10.74L22 12L14.74 13.26L17 18L13.09 15.74L12 22L10.91 15.74L7 18L9.26 13.26L2 12L9.26 10.74L7 6L10.91 8.26L12 2Z" />
          </svg>
        </motion.div>
        <div className="text-xs text-purple-600 font-medium">Carregando...</div>
      </div>
    </div>
  );

  // Imagem do verso da carta
  const cardBackPlaceholder = (
    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center rounded-lg">
      <div className="text-center text-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-2"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4H15.5L19,7.5V9Z" />
          </svg>
        </motion.div>
        <div className="text-xs font-medium opacity-80">Universo Catia</div>
      </div>
    </div>
  );

  const handleCardClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={handleCardClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ rotateY: 180 }}
      animate={{ rotateY: isRevealed ? 0 : 180 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Face da frente (carta revelada) */}
      <div 
        className={`absolute inset-0 ${isRevealed ? 'block' : 'hidden'}`}
        style={{ backfaceVisibility: "hidden" }}
      >
        <LazyImage
          src={card.img}
          alt={card.name || card.nome}
          className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-white"
          placeholder={cardPlaceholder}
          quality="high"
          priority={priority}
          sizes="(max-width: 768px) 150px, 200px"
        />
        
        {/* Overlay de seleção */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-purple-500/30 rounded-lg border-2 border-purple-400 flex items-center justify-center"
          >
            <div className="bg-white/90 px-3 py-1 rounded-full">
              <span className="text-purple-700 font-bold text-sm">Selecionada</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Face de trás (verso da carta) */}
      <div 
        className={`absolute inset-0 ${!isRevealed ? 'block' : 'hidden'}`}
        style={{ 
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)"
        }}
      >
        <LazyImage
          src="/cards/verso-carta.jpg"
          alt="Verso da carta"
          className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-white"
          placeholder={cardBackPlaceholder}
          quality="medium"
          priority={priority}
          sizes="(max-width: 768px) 150px, 200px"
        />
        
        {/* Efeito de brilho místico */}
        <motion.div
          animate={{ 
            background: [
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
              "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 60%, transparent 80%)",
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-lg"
        />
      </div>

      {/* Efeito de hover */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
        whileHover={{ 
          boxShadow: "0 20px 25px rgba(0,0,0,0.15), 0 0 20px rgba(147,51,234,0.3)" 
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default OptimizedTarotCard; 