// LIMPAR CACHE DO FRONTEND - VERSÃO ATUALIZADA
// Execute este código no console do navegador

console.log('🧹 LIMPANDO CACHE DO FRONTEND...');

// 1. Limpar localStorage antigo
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.startsWith('horoscopo-') || key.startsWith('horoscopo-diario-'))) {
    keysToRemove.push(key);
  }
}

console.log('🗑️ Chaves encontradas para remoção:', keysToRemove);

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removido: ${key}`);
});

// 2. Limpar cache em memória (se disponível)
if (window.horoscopoCache) {
  window.horoscopoCache.clear();
  console.log('✅ Cache em memória limpo');
}

// 3. Forçar recarregamento da página
console.log('🔄 Recarregando página...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('✅ Cache limpo! A página será recarregada em 1 segundo.'); 