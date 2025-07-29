// Script para limpar cache completo do localStorage e sessionStorage

console.log('🧹 LIMPEZA COMPLETA DE CACHE\n');

// Função para simular limpeza de localStorage
function simularLimpezaCache() {
  console.log('💾 Limpando localStorage...');
  
  const chavesParaLimpar = [
    // Cache de horóscopo
    'horoscopo-diario-',
    'horoscopo-semanal-',
    
    // Cache de usuário
    'user-cache',
    'userData',
    'sign-cache',
    'signo-cache',
    
    // Cache de autenticação
    'firebase:authUser',
    'firebase:host',
    
    // Cache da aplicação
    'app-cache',
    'catia-cache',
    
    // Cache de componentes
    'premium-modal-cache',
    'horoscope-card-cache'
  ];
  
  console.log('🔍 Chaves que serão limpas:');
  chavesParaLimpar.forEach(chave => {
    console.log(`  - ${chave}*`);
  });
  
  console.log('\n⚠️ IMPORTANTE: Execute este comando no console do navegador:');
  console.log('');
  console.log('// LIMPEZA COMPLETA');
  console.log('localStorage.clear();');
  console.log('sessionStorage.clear();');
  console.log('');
  console.log('// OU LIMPEZA ESPECÍFICA');
  console.log('Object.keys(localStorage).forEach(key => {');
  console.log('  if (key.includes("horoscopo") || key.includes("sign") || key.includes("firebase")) {');
  console.log('    localStorage.removeItem(key);');
  console.log('    console.log("🗑️ Removido:", key);');
  console.log('  }');
  console.log('});');
  console.log('');
  console.log('// DEPOIS RECARREGUE A PÁGINA');
  console.log('window.location.reload();');
}

simularLimpezaCache();

console.log('\n🔧 PASSOS PARA RESOLVER O PROBLEMA:');
console.log('');
console.log('1. 📱 Abra o app no navegador');
console.log('2. 🔍 Pressione F12 (DevTools)');
console.log('3. 📝 Vá na aba Console');
console.log('4. 🧹 Execute os comandos acima');
console.log('5. 🔄 Recarregue a página');
console.log('6. 👀 Verifique se o signo aparece');
console.log('');
console.log('📋 CHECKLIST DE DEBUG:');
console.log('□ Cache limpo');
console.log('□ Página recarregada');
console.log('□ Usuário logado');
console.log('□ Data de nascimento salva');
console.log('□ Signo calculado corretamente');
console.log('□ Estado React atualizado');
console.log('');
console.log('🚨 Se ainda não funcionar:');
console.log('• Logout e login novamente');
console.log('• Limpar cookies do site');
console.log('• Tentar em aba anônima');
console.log('• Verificar erros no console'); 