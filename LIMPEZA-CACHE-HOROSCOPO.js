// Script para limpar cache do horóscopo e diagnosticar problema
// Execute no console do navegador para limpar cache antigo

console.log('🧹 LIMPANDO CACHE DO HORÓSCOPO...');

// 1. Verificar cache existente
console.log('🔍 Verificando localStorage...');
const keys = Object.keys(localStorage);
const horoscopoKeys = keys.filter(key => key.includes('horoscopo'));

console.log(`📊 Encontradas ${horoscopoKeys.length} chaves de horóscopo:`);
horoscopoKeys.forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`📦 ${key}:`, {
      timestamp: new Date(data.timestamp).toLocaleString(),
      preview: data.data ? data.data.substring(0, 50) + '...' : 'No data'
    });
  } catch (e) {
    console.log(`❌ ${key}: Erro ao ler`);
  }
});

// 2. Limpar todo cache de horóscopo
console.log('🧹 Limpando cache...');
horoscopoKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removido: ${key}`);
});

// 3. Limpar cache em memória (se possível)
console.log('🧹 Tentando limpar cache em memória...');
if (window.horoscopoDiarioCache) {
  window.horoscopoDiarioCache.clear();
  console.log('✅ Cache em memória limpo');
} else {
  console.log('⚠️ Cache em memória não encontrado');
}

// 4. Forçar reload da página
console.log('🔄 INSTRUÇÕES:');
console.log('1. ✅ Cache limpo com sucesso!');
console.log('2. 🔄 Recarregue a página (F5 ou Cmd+R)');
console.log('3. 🔍 Verifique se horóscopo carrega corretamente');
console.log('4. 📱 Se ainda aparecer "indisponível", abra DevTools para ver logs');

console.log('✅ LIMPEZA CONCLUÍDA!'); 