// CÓDIGO NODE-RED CORRIGIDO PARA HORÓSCOPO DIÁRIO
// Adicione este código no Function node "Processar Requisicao Diario"

console.log('🚀 INICIANDO PROCESSAMENTO DIÁRIO (CORRIGIDO)...');

// Função para obter chave do dia atual com fuso horário brasileiro
function getDayKey(date = new Date()) {
  // Forçar fuso horário brasileiro
  const dataBR = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const year = dataBR.getFullYear();
  const month = (dataBR.getMonth() + 1).toString().padStart(2, '0');
  const day = dataBR.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// Gerar URL completa para horóscopo diário
const diaAtual = getDayKey();
const urlCompleta = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaAtual}/signos/${sign}`;

console.log('🔍 DEBUG: URL completa gerada (DIÁRIO CORRIGIDO):');
console.log('  Data atual (BR):', new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));
console.log('  Dia chave:', diaAtual);
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
msg.dia = diaAtual;

console.log('✅ DEBUG: Configuração concluída (DIÁRIO CORRIGIDO)');
console.log('  - msg.url:', msg.url);
console.log('  - msg.method:', msg.method);
console.log('  - msg.headers:', msg.headers);

return msg; 