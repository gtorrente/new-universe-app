// Serviço de pré-processamento e otimização de imagens
class ImagePreprocessor {
  constructor() {
    this.processedImages = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
    this.webpSupported = null;
  }

  // Verificar suporte WebP
  async checkWebPSupport() {
    if (this.webpSupported !== null) return this.webpSupported;

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.webpSupported = webP.height === 2;
        resolve(this.webpSupported);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Configurações por categoria de imagem
  getOptimizationSettings(category) {
    const settings = {
      'premium-cards': {
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 400,
        format: 'webp',
        generateThumbnail: true
      },
      'tarot-cards': {
        quality: 0.9,
        maxWidth: 300,
        maxHeight: 500,
        format: 'webp',
        generateThumbnail: false
      },
      'profile-images': {
        quality: 0.8,
        maxWidth: 200,
        maxHeight: 200,
        format: 'webp',
        generateThumbnail: true
      },
      'logos': {
        quality: 0.9,
        maxWidth: 400,
        maxHeight: 400,
        format: 'png', // Manter PNG para logos
        generateThumbnail: false
      },
      'recipe-images': {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600,
        format: 'webp',
        generateThumbnail: true
      },
      'default': {
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 800,
        format: 'webp',
        generateThumbnail: false
      }
    };

    return settings[category] || settings['default'];
  }

  // Otimizar imagem individual
  async optimizeImage(src, category = 'default') {
    const cacheKey = `${src}-${category}`;
    
    // Verificar cache
    if (this.processedImages.has(cacheKey)) {
      return this.processedImages.get(cacheKey);
    }

    const settings = this.getOptimizationSettings(category);
    const webpSupported = await this.checkWebPSupport();
    
    const finalFormat = settings.format === 'webp' && !webpSupported ? 'jpeg' : settings.format;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const result = this.processImage(img, settings, finalFormat);
          this.processedImages.set(cacheKey, result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
      img.src = src;
    });
  }

  // Processar imagem no canvas
  processImage(img, settings, format) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calcular dimensões otimizadas
    const { width: originalWidth, height: originalHeight } = img;
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Redimensionar mantendo proporção
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

    // Aplicar filtros se necessário
    this.applyImageFilters(ctx, newWidth, newHeight);

    // Desenhar imagem
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Gerar resultado
    const result = {
      optimized: canvas.toDataURL(`image/${format}`, settings.quality),
      thumbnail: null,
      originalSize: this.estimateImageSize(originalWidth, originalHeight),
      optimizedSize: null,
      dimensions: { width: newWidth, height: newHeight },
      format: format,
      compressionRatio: null
    };

    // Calcular tamanhos
    result.optimizedSize = result.optimized.length;
    result.compressionRatio = ((result.originalSize - result.optimizedSize) / result.originalSize * 100).toFixed(1);

    // Gerar thumbnail se necessário
    if (settings.generateThumbnail) {
      result.thumbnail = this.generateThumbnail(canvas, 150);
    }

    return result;
  }

  // Aplicar filtros de otimização
  applyImageFilters(ctx, width, height) {
    // Sharpening filter para melhor qualidade em tamanhos menores
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Filtro de nitidez simples
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      if (brightness > 128) {
        data[i] = Math.min(255, data[i] * 1.05);     // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.05); // B
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Gerar thumbnail
  generateThumbnail(canvas, size) {
    const thumbCanvas = document.createElement('canvas');
    const thumbCtx = thumbCanvas.getContext('2d');

    thumbCanvas.width = size;
    thumbCanvas.height = size;

    // Crop centralizado para thumbnail quadrado
    const sourceSize = Math.min(canvas.width, canvas.height);
    const startX = (canvas.width - sourceSize) / 2;
    const startY = (canvas.height - sourceSize) / 2;

    thumbCtx.drawImage(
      canvas,
      startX, startY, sourceSize, sourceSize,
      0, 0, size, size
    );

    return thumbCanvas.toDataURL('image/webp', 0.7);
  }

  // Estimar tamanho da imagem
  estimateImageSize(width, height) {
    return width * height * 3; // Aproximação para RGB
  }

  // Otimizar lote de imagens
  async optimizeBatch(images) {
    const results = [];
    
    for (const { src, category } of images) {
      try {
        const result = await this.optimizeImage(src, category);
        results.push({ src, ...result });
        
        // Log de progresso
        console.log(`✅ Otimizada: ${src} - Economia: ${result.compressionRatio}%`);
      } catch (error) {
        console.error(`❌ Erro ao otimizar ${src}:`, error);
        results.push({ src, error: error.message });
      }
    }

    return results;
  }

  // Pré-carregar imagens críticas
  preloadCriticalImages(imageSources) {
    imageSources.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      
      // Tentar WebP primeiro
      if (this.webpSupported) {
        link.type = 'image/webp';
      }
      
      document.head.appendChild(link);
      
      console.log(`🚀 Preload: ${src}`);
    });
  }

  // Limpar cache de imagens processadas
  clearCache() {
    this.processedImages.clear();
    console.log('🧹 Cache de imagens limpo');
  }

  // Estatísticas do processamento
  getStats() {
    const totalImages = this.processedImages.size;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const result of this.processedImages.values()) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
    }

    const totalSavings = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)
      : 0;

    return {
      totalImages,
      totalOriginalSize: this.formatBytes(totalOriginalSize),
      totalOptimizedSize: this.formatBytes(totalOptimizedSize),
      totalSavings: `${totalSavings}%`,
      webpSupported: this.webpSupported
    };
  }

  // Formatar bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Instância singleton
const imagePreprocessor = new ImagePreprocessor();

export default imagePreprocessor;

// Utilitários de conveniência
export const optimizeImage = (src, category) => imagePreprocessor.optimizeImage(src, category);
export const optimizeBatch = (images) => imagePreprocessor.optimizeBatch(images);
export const preloadCriticalImages = (images) => imagePreprocessor.preloadCriticalImages(images);
export const getImageStats = () => imagePreprocessor.getStats(); 