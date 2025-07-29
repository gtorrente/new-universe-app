// SCRIPT PARA LIMPAR CACHE DA PREVISÃO SEMANAL
// Execute este código no console do navegador na página de previsão semanal

console.log('🧹 LIMPANDO CACHE DA PREVISÃO SEMANAL...');

// 1. Limpar localStorage da previsão semanal
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('horoscopo-')) {
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