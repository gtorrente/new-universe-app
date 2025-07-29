// Script para testar lógica inteligente de horário

// Função para obter chave do dia
function getDayKey(date = new Date()) {
  const dataBR = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const year = dataBR.getFullYear();
  const month = (dataBR.getMonth() + 1).toString().padStart(2, '0');
  const day = dataBR.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função inteligente para decidir qual data usar
function getDayKeyInteligente(dataCustomizada = null) {
  const agora = dataCustomizada || new Date();
  const horaBR = new Date(agora.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const horaAtual = horaBR.getHours();
  
  console.log(`🕐 Hora atual (BR): ${horaAtual}:${horaBR.getMinutes().toString().padStart(2, '0')}`);
  
  // Se for entre 00:00 e 05:59, usar horóscopo do dia anterior
  if (horaAtual >= 0 && horaAtual <= 5) {
    console.log('🌙 Horário madrugada (00:00-05:59) - usando horóscopo do dia anterior');
    const ontem = new Date(horaBR);
    ontem.setDate(ontem.getDate() - 1);
    return getDayKey(ontem);
  } else {
    console.log('☀️ Horário normal (06:00-23:59) - usando horóscopo de hoje');
    return getDayKey(horaBR);
  }
}

console.log('🧪 TESTANDO LÓGICA INTELIGENTE DE HORÁRIO\n');

// Teste com horário atual
console.log('=== TESTE 1: Horário atual ===');
const diaAtual = getDayKeyInteligente();
console.log(`📅 Dia chave escolhido: ${diaAtual}\n`);

// Teste com diferentes horários
const horariosTest = [
  { hora: 2, minuto: 30, desc: 'Madrugada (02:30)' },
  { hora: 5, minuto: 45, desc: 'Final da madrugada (05:45)' },
  { hora: 6, minuto: 0, desc: 'Início do dia (06:00)' },
  { hora: 12, minuto: 0, desc: 'Meio-dia (12:00)' },
  { hora: 18, minuto: 30, desc: 'Noite (18:30)' },
  { hora: 23, minuto: 59, desc: 'Final do dia (23:59)' }
];

horariosTest.forEach((teste, index) => {
  console.log(`=== TESTE ${index + 2}: ${teste.desc} ===`);
  
  // Criar data customizada para teste
  const dataCustomizada = new Date();
  dataCustomizada.setHours(teste.hora, teste.minuto, 0, 0);
  
  const diaEscolhido = getDayKeyInteligente(dataCustomizada);
  console.log(`📅 Dia chave escolhido: ${diaEscolhido}\n`);
});

console.log('✅ Testes concluídos!\n');

console.log('📋 RESUMO DA LÓGICA:');
console.log('🌙 00:00 - 05:59: Usa horóscopo do DIA ANTERIOR');
console.log('☀️ 06:00 - 23:59: Usa horóscopo do DIA ATUAL');
console.log('');
console.log('💡 BENEFÍCIOS:');
console.log('• Elimina gap entre 00:00 e 06:00');
console.log('• Sempre tem horóscopo disponível');
console.log('• Transição suave entre dias');
console.log('• Cron às 06:00 continua funcionando normalmente'); 