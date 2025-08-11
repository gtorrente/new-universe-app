import LazyImage from './LazyImage';

export default function HoroscopeCard({ sign, message }) {
    // Placeholder para o avatar da Catia
    const avatarPlaceholder = (
      <div className="w-full h-full bg-purple-400/20 rounded-lg flex items-center justify-center">
        <div className="text-white/60 text-xs">✨</div>
      </div>
    );

    return (
        <div className="w-full rounded-2xl p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow overflow-visible relative min-h-[180px] sm:min-h-[190px] md:min-h-[200px]">
        
        <h2 className="text-lg font-bold mb-2">Horóscopo do Dia</h2>
        <p className="text-sm opacity-90 mb-3">{sign}</p>
        
        {/* Área do texto com padding responsivo via CSS */}
        <div 
          className="text-sm leading-relaxed pr-[25%] lg:pr-[160px]" 
          style={{ 
            wordWrap: 'break-word', 
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          {message}
        </div>
        
        {/* Avatar da Catia - responsivo: mobile atual, desktop dentro do card */}
        <div className="absolute right-0 bottom-0 w-[28%] lg:w-[140px] lg:h-[160px] lg:bottom-2"
             style={{
               aspectRatio: '3/4'
             }}>
          <LazyImage
            src={new URL('../assets/catia-ia-avatar.png', import.meta.url).href}
            alt="Avatar da Catia" 
            className="w-full h-full object-cover lg:h-[160px]"
            style={{
              objectPosition: '50% 20%', // Focado no rosto e parte superior
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))', // Drop-shadow ativo
            }}
            placeholder={avatarPlaceholder}
            quality="high"
            sizes="(max-width: 1023px) 28vw, 140px"
            priority={false}
          />
        </div>
      </div>
    )
  }
  