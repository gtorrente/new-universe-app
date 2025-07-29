// Script para testar a API de horóscopo após aplicar lógica inteligente

console.log('🧪 TESTANDO API APÓS LÓGICA INTELIGENTE\n');

// Simular chamada para API
async function testarAPI(signo) {
  try {
    const apiUrl = 'https://api.torrente.com.br';
    const url = `${apiUrl}/horoscopo?sign=${signo}`;
    
    console.log(`🌐 Testando: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📦 Resposta da API:');
    console.log('  - success:', data.success);
    
    if (data.success) {
      console.log('  - horóscopo:', data.data?.horoscopo?.mensagem?.substring(0, 100) + '...');
      console.log('✅ SUCESSO! Horóscopo carregado');
    } else {
      console.log('  - erro:', data.error);
      console.log('❌ FALHA na API');
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Erro na requisição: ${error.message}`);
    return null;
  }
}

// Função principal para testar
async function executarTestes() {
  const horaAtual = new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'});
  console.log(`🕐 Hora atual: ${horaAtual}`);
  console.log(`🌙 Deveria buscar horóscopo de: 2025-07-28 (ontem)\n`);
  
  // Testar alguns signos
  const signosTestar = ['libra', 'leo', 'aries'];
  
  for (const signo of signosTestar) {
    console.log(`=== TESTE: ${signo.toUpperCase()} ===`);
    await testarAPI(signo);
    console.log('');
  }
  
  console.log('🎯 RESULTADO ESPERADO:');
  console.log('✅ Todas as chamadas deveriam retornar success: true');
  console.log('✅ Horóscopo deve aparecer na Home do app');
  console.log('✅ Signo deve ser exibido no card');
  console.log('');
  console.log('🔄 Agora teste no navegador!');
}

// Executar testes
executarTestes().catch(console.error); 