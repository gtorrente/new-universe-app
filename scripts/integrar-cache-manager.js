// INSTRUÇÕES PARA INTEGRAR CACHE MANAGER NO FRONTEND
// Adicione este código no seu arquivo principal (ex: main.jsx ou App.jsx)

// 1. IMPORTAR O CACHE MANAGER
// Adicione no início do seu arquivo principal:

import './cache-manager.js'; // Se estiver em um arquivo separado

// OU cole o código diretamente:

class CacheManager {
  constructor() {
    this.cachePrefix = 'horoscopo-';
    this.maxAge = 24 * 60 * 60 * 1000; // 24 horas
    this.cleanupInterval = 30 * 60 * 1000; // 30 minutos
    this.maxCacheSize = 50; // Máximo de itens no cache
    
    // Iniciar limpeza automática
    this.startAutoCleanup();
    
    // Limpeza na inicialização
    this.cleanup();
    
    console.log('🧹 CacheManager iniciado com limpeza automática');
  }

  // Limpeza automática periódica
  startAutoCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Limpeza inteligente do cache
  cleanup() {
    console.log('🧹 Iniciando limpeza automática do cache...');
    
    const keysToRemove = [];
    const cacheItems = [];
    
    // Coletar todos os itens do cache
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cachePrefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.timestamp) {
            cacheItems.push({
              key,
              timestamp: data.timestamp,
              size: JSON.stringify(data).length
            });
          } else {
            keysToRemove.push(key); // Dados corrompidos
          }
        } catch (error) {
          keysToRemove.push(key); // Dados corrompidos
        }
      }
    }

    // 1. Remover itens expirados
    const now = Date.now();
    cacheItems.forEach(item => {
      if (now - item.timestamp > this.maxAge) {
        keysToRemove.push(item.key);
      }
    });

    // 2. Remover itens antigos se exceder limite
    if (cacheItems.length > this.maxCacheSize) {
      const sortedItems = cacheItems
        .filter(item => !keysToRemove.includes(item.key))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const itemsToRemove = sortedItems.slice(0, cacheItems.length - this.maxCacheSize);
      itemsToRemove.forEach(item => keysToRemove.push(item.key));
    }

    // 3. Executar remoção
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    if (keysToRemove.length > 0) {
      console.log(`✅ Cache limpo: ${keysToRemove.length} itens removidos`);
      console.log(`📊 Cache atual: ${cacheItems.length - keysToRemove.length} itens`);
    } else {
      console.log('✅ Cache já está limpo');
    }

    // 4. Limpar cache em memória (se disponível)
    if (window.horoscopoCache) {
      const beforeSize = window.horoscopoCache.size;
      window.horoscopoCache.clear();
      console.log(`🧠 Cache em memória limpo: ${beforeSize} itens removidos`);
    }
  }

  // Limpeza manual completa
  forceCleanup() {
    console.log('🧹 Forçando limpeza completa do cache...');
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cachePrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    if (window.horoscopoCache) {
      window.horoscopoCache.clear();
    }

    console.log(`✅ Limpeza completa: ${keysToRemove.length} itens removidos`);
    return keysToRemove.length;
  }

  // Estatísticas do cache
  getStats() {
    const stats = {
      totalItems: 0,
      expiredItems: 0,
      totalSize: 0,
      oldestItem: null,
      newestItem: null
    };

    const now = Date.now();
    const items = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cachePrefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.timestamp) {
            stats.totalItems++;
            stats.totalSize += JSON.stringify(data).length;
            
            const age = now - data.timestamp;
            if (age > this.maxAge) {
              stats.expiredItems++;
            }

            items.push({
              key,
              timestamp: data.timestamp,
              age: age
            });
          }
        } catch (error) {
          // Ignorar dados corrompidos
        }
      }
    }

    if (items.length > 0) {
      items.sort((a, b) => a.timestamp - b.timestamp);
      stats.oldestItem = items[0];
      stats.newestItem = items[items.length - 1];
    }

    return stats;
  }
}

// Inicializar o gerenciador de cache
const cacheManager = new CacheManager();

// Expor para uso global
window.cacheManager = cacheManager;

console.log('🚀 CacheManager carregado e ativo!');

// 2. ADICIONAR BOTÃO DE LIMPEZA MANUAL (OPCIONAL)
// Adicione este componente no seu app:

function CacheControlPanel() {
  const [stats, setStats] = useState(null);

  const handleForceCleanup = () => {
    if (window.cacheManager) {
      const removed = window.cacheManager.forceCleanup();
      alert(`Cache limpo! ${removed} itens removidos.`);
      updateStats();
    }
  };

  const updateStats = () => {
    if (window.cacheManager) {
      setStats(window.cacheManager.getStats());
    }
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <div>📊 Cache: {stats.totalItems} itens</div>
      <div>🗑️ Expirados: {stats.expiredItems}</div>
      <div>💾 Tamanho: {Math.round(stats.totalSize / 1024)}KB</div>
      <button 
        onClick={handleForceCleanup}
        style={{
          background: '#ff4444',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '5px'
        }}
      >
        Limpar Cache
      </button>
    </div>
  );
}

// 3. USAR NO SEU APP
// Adicione o componente no seu App.jsx:

function App() {
  return (
    <div>
      {/* Seus componentes existentes */}
      <CacheControlPanel /> {/* Adicione esta linha */}
    </div>
  );
} 