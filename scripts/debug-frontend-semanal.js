// SCRIPT PARA DEBUG DO FRONTEND SEMANAL
// Execute este código no console do navegador na página de previsão semanal

console.log('🔍 DEBUG: Verificando dados da previsão semanal...');

// 1. Verificar se a API está sendo chamada
console.log('📡 Verificando chamada da API...');
fetch('https://api.torrente.com.br/horoscopo-semanal?sign=aries', {
  method: "GET",
  headers: { "Content-Type": "application/json" }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Resposta da API:', data);
  
  // 2. Verificar estrutura dos dados
  if (data.success && data.data) {
    console.log('📊 Estrutura dos dados:');
    console.log('  - destaque:', data.data.destaque);
    console.log('  - semana:', data.data.semana);
    console.log('  - dias disponíveis:', Object.keys(data.data.semana || {}));
    
    // 3. Verificar formatação dos dias
    if (data.data.semana) {
      const semanaFormatada = [
        { dia: "Seg", ...data.data.semana.segunda },
        { dia: "Ter", ...data.data.semana.terca },
        { dia: "Qua", ...data.data.semana.quarta },
        { dia: "Qui", ...data.data.semana.quinta },
        { dia: "Sex", ...data.data.semana.sexta },
        { dia: "Sáb", ...data.data.semana.sabado },
        { dia: "Dom", ...data.data.semana.domingo }
      ];
      
      console.log('🎯 Dias formatados:', semanaFormatada);
      
      // 4. Verificar se cada dia tem os campos necessários
      semanaFormatada.forEach((dia, index) => {
        console.log(`📅 Dia ${index + 1} (${dia.dia}):`, {
          tema: dia.tema,
          trecho: dia.trecho,
          cor: dia.cor,
          icone: dia.icone
        });
      });
    }
  }
})
.catch(error => {
  console.error('❌ Erro na API:', error);
});

// 5. Verificar localStorage
console.log('💾 Verificando localStorage...');
const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('horoscopo-'));
console.log('  - Chaves de cache:', localStorageKeys);

localStorageKeys.forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`  - ${key}:`, data);
  } catch (e) {
    console.log(`  - ${key}: Erro ao parsear`);
  }
});

// 6. Verificar variáveis do React (se disponível)
console.log('⚛️ Verificando variáveis do React...');
if (typeof window !== 'undefined') {
  // Tentar acessar variáveis do React DevTools
  console.log('  - Verifique as variáveis no React DevTools');
  console.log('  - Procure por: semana, destaque, loading, error');
}

console.log('✅ Debug concluído! Verifique o console para mais detalhes.'); 