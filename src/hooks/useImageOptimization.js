import { useState, useEffect, useCallback } from 'react';

// Cache de imagens otimizadas
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export const useImageOptimization = () => {
  const [optimizedImages, setOptimizedImages] = useState(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  // Configurações padrão de otimização
  const defaultSettings = {
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
    format: 'webp', // 'webp', 'jpeg', 'png'
    progressive: true
  };

  // Verificar suporte a WebP
  const isWebPSupported = useCallback(() => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }, []);

  // Otimizar imagem
  const optimizeImage = useCallback(async (src, customSettings = {}) => {
    const settings = { ...defaultSettings, ...customSettings };
    const cacheKey = `${src}-${JSON.stringify(settings)}`;

    // Verificar cache primeiro
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    setIsProcessing(true);

    try {
      // Verificar se WebP é suportado
      const webpSupported = await isWebPSupported();
      const finalFormat = settings.format === 'webp' && !webpSupported ? 'jpeg' : settings.format;

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calcular dimensões otimizadas
            const { width: originalWidth, height: originalHeight } = img;
            const aspectRatio = originalWidth / originalHeight;

            let newWidth = originalWidth;
            let newHeight = originalHeight;

            // Redimensionar se necessário
            if (originalWidth > settings.maxWidth) {
              newWidth = settings.maxWidth;
              newHeight = newWidth / aspectRatio;
            }

            if (newHeight > settings.maxHeight) {
              newHeight = settings.maxHeight;
              newWidth = newHeight * aspectRatio;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Configurar qualidade de renderização
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Desenhar imagem otimizada
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Converter para formato otimizado
            const mimeType = `image/${finalFormat}`;
            const optimizedData = canvas.toDataURL(mimeType, settings.quality);

            // Calcular economia de espaço
            const originalSize = src.length;
            const optimizedSize = optimizedData.length;
            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

            const result = {
              optimized: optimizedData,
              originalSize,
              optimizedSize,
              savings: `${savings}%`,
              dimensions: { width: newWidth, height: newHeight },
              format: finalFormat
            };

            // Salvar no cache
            imageCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });

            // Atualizar estado local
            setOptimizedImages(prev => new Map(prev).set(src, result));

            resolve(result);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Falha ao carregar imagem'));
        };

        img.src = src;
      });
    } catch (error) {
      console.error('Erro na otimização:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [defaultSettings, isWebPSupported]);

  // Otimizar lote de imagens
  const optimizeBatch = useCallback(async (images, settings = {}) => {
    setIsProcessing(true);
    const results = [];

    try {
      for (const image of images) {
        const result = await optimizeImage(image.src, { ...settings, ...image.settings });
        results.push({ ...image, ...result });
      }
      return results;
    } finally {
      setIsProcessing(false);
    }
  }, [optimizeImage]);

  // Gerar srcset para imagens responsivas
  const generateSrcSet = useCallback(async (src, breakpoints = [400, 800, 1200]) => {
    const srcsetEntries = [];

    for (const width of breakpoints) {
      const optimized = await optimizeImage(src, { maxWidth: width });
      srcsetEntries.push(`${optimized.optimized} ${width}w`);
    }

    return srcsetEntries.join(', ');
  }, [optimizeImage]);

  // Preload de imagens críticas
  const preloadCriticalImages = useCallback((images) => {
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.type = 'image/webp';
      document.head.appendChild(link);
    });
  }, []);

  // Limpar cache expirado
  useEffect(() => {
    const cleanupCache = () => {
      const now = Date.now();
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          imageCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanupCache, 60 * 60 * 1000); // Limpar a cada hora
    return () => clearInterval(interval);
  }, []);

  return {
    optimizeImage,
    optimizeBatch,
    generateSrcSet,
    preloadCriticalImages,
    optimizedImages,
    isProcessing,
    cacheSize: imageCache.size
  };
};

// Utilitários de otimização
export const ImageUtils = {
  // Converter blob para base64
  blobToBase64: (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  },

  // Calcular tamanho de arquivo
  getImageSize: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  },

  // Compressão agressiva para thumbnails
  createThumbnail: (src, size = 150) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = size;
        canvas.height = size;
        
        // Crop e redimensionar para thumbnail quadrado
        const { width, height } = img;
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;
        
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        
        resolve(canvas.toDataURL('image/webp', 0.7));
      };
      img.src = src;
    });
  }
}; 