// Teste da lógica corrigida V2

// Função para obter chave do dia com fuso horário brasileiro (mais robusta)
function getDayKey(date = new Date()) {
  // Criar nova data em fuso brasileiro
  const dataBR = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const year = dataBR.getFullYear();
  const month = (dataBR.getMonth() + 1).toString().padStart(2, '0');
  const day = dataBR.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função inteligente para decidir qual data usar (CORRIGIDA)
function getDayKeyInteligente() {
  // Obter data/hora atual do Brasil
  const agoraBR = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const horaAtual = agoraBR.getHours();
  
  console.log(`🕐 Hora atual (BR): ${horaAtual}:${agoraBR.getMinutes().toString().padStart(2, '0')}`);
  console.log(`📅 Data atual (BR): ${agoraBR.toLocaleDateString('pt-BR')}`);
  
  // Se for entre 00:00 e 05:59, usar horóscopo do dia anterior
  if (horaAtual >= 0 && horaAtual <= 5) {
    console.log('🌙 Horário madrugada (00:00-05:59) - usando horóscopo do dia anterior');
    
    // Calcular dia anterior de forma mais robusta
    const ontem = new Date(agoraBR.getTime() - (24 * 60 * 60 * 1000)); // Subtrair 24h em milissegundos
    const diaAnterior = getDayKey(ontem);
    
    console.log(`📅 Dia anterior calculado: ${diaAnterior}`);
    return diaAnterior;
  } else {
    console.log('☀️ Horário normal (06:00-23:59) - usando horóscopo de hoje');
    
    const diaAtual = getDayKey(agoraBR);
    console.log(`📅 Dia atual calculado: ${diaAtual}`);
    return diaAtual;
  }
}

console.log('🧪 TESTE LÓGICA CORRIGIDA V2\n');

const resultado = getDayKeyInteligente();
console.log('\n🎯 RESULTADO FINAL:');
console.log(`📅 Dia chave: ${resultado}`);
console.log(`🔗 URL seria: horoscopos_diarios/${resultado}/signos/[signo]`);

console.log('\n✅ Se o resultado for 2025-07-28, a correção funcionou!'); 