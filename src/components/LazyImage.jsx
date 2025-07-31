import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = null,
  quality = 'medium', // 'low', 'medium', 'high'
  sizes = '100vw',
  priority = false,
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Configurações de qualidade para compressão
  const qualitySettings = {
    low: { quality: 0.6, maxWidth: 800 },
    medium: { quality: 0.8, maxWidth: 1200 },
    high: { quality: 0.9, maxWidth: 1920 }
  };

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  // Otimização de imagem
  useEffect(() => {
    if (!isInView || hasError) return;

    const optimizeImage = async () => {
      try {
        const settings = qualitySettings[quality];
        
        // Verificar se é uma URL externa ou asset local
        if (src.startsWith('http') || src.startsWith('/')) {
          setOptimizedSrc(src);
          return;
        }

        // Para assets locais, aplicar otimização
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calcular dimensões otimizadas
          const { width, height } = img;
          const aspectRatio = width / height;
          
          let newWidth = Math.min(width, settings.maxWidth);
          let newHeight = newWidth / aspectRatio;

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Converter para WebP se suportado, senão JPEG
          const format = isWebPSupported() ? 'webp' : 'jpeg';
          const optimized = canvas.toDataURL(`image/${format}`, settings.quality);
          
          setOptimizedSrc(optimized);
        };

        img.onerror = () => {
          setOptimizedSrc(src); // Fallback para original
        };

        img.src = src;
      } catch (error) {
        console.warn('Erro na otimização da imagem:', error);
        setOptimizedSrc(src);
      }
    };

    optimizeImage();
  }, [isInView, src, quality, hasError]);

  // Verificar suporte a WebP
  const isWebPSupported = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Handlers de eventos
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    setOptimizedSrc(src); // Fallback
    onError();
  };

  // Placeholder padrão
  const defaultPlaceholder = (
    <div className={`bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center ${className}`}>
      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Placeholder enquanto carrega */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10"
        >
          {placeholder || defaultPlaceholder}
        </motion.div>
      )}

      {/* Imagem principal */}
      {isInView && (
        <motion.img
          src={optimizedSrc || src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          {...props}
        />
      )}

      {/* Indicador de erro */}
      {hasError && (
        <div className={`bg-red-50 border border-red-200 flex items-center justify-center ${className}`}>
          <div className="text-center p-4">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-red-600">Erro ao carregar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage; 