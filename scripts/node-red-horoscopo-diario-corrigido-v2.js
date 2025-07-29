// CÓDIGO NODE-RED CORRIGIDO V2 PARA HORÓSCOPO DIÁRIO
// Adicione este código no Function node "Processar Requisicao Diario"

console.log('🚀 INICIANDO PROCESSAMENTO DIÁRIO (CORRIGIDO V2)...');

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

// Extrair signo da requisição
const { sign } = msg.payload;

console.log('📥 Payload recebido:', msg.payload);
console.log('📥 Signo extraído:', sign);

if (!sign) {
  console.error('❌ Signo não especificado');
  msg.payload = {
    success: false,
    error: "Signo não especificado",
    message: "Parâmetro 'sign' é obrigatório"
  };
  return msg;
}

// Gerar URL completa para horóscopo diário (com lógica inteligente CORRIGIDA)
const diaChave = getDayKeyInteligente();
const urlCompleta = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaChave}/signos/${sign}`;

console.log('🔍 DEBUG: URL completa gerada (DIÁRIO INTELIGENTE V2):');
console.log('  Data/hora atual (BR):', new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));
console.log('  Dia chave usado:', diaChave);
console.log('  URL:', urlCompleta);

// IMPORTANTE: Definir msg.url com a URL completa
msg.url = urlCompleta;
msg.method = 'GET';
msg.headers = {
  'Content-Type': 'application/json'
};

// Armazenar informações adicionais
msg.isSemanal = false;
msg.signo = sign;
msg.dia = diaChave;

console.log('✅ DEBUG: Configuração concluída (DIÁRIO INTELIGENTE V2)');
console.log('  - msg.url:', msg.url);
console.log('  - msg.method:', msg.method);
console.log('  - msg.headers:', msg.headers);

return msg; 