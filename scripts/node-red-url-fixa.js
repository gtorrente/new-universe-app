// CÓDIGO COM URL FIXA - RESOLVE DEFINITIVAMENTE O PROBLEMA
// Adicione este código no Function node "Processar Requisicao"

console.log('🚀 INICIANDO PROCESSAMENTO COM URL FIXA...');

// Função para obter chave da semana atual
function getWeekKey() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
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

// Gerar URL completa
const semana = getWeekKey();
const urlCompleta = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_semanais/${semana}/signos/${sign}`;

console.log('🔍 DEBUG: URL completa gerada:');
console.log('  ', urlCompleta);

// IMPORTANTE: Definir msg.url com a URL completa
msg.url = urlCompleta;
msg.method = 'GET';
msg.headers = {
  'Content-Type': 'application/json'
};

// Armazenar informações adicionais
msg.isSemanal = msg.req?.url?.includes('horoscopo-semanal');
msg.signo = sign;
msg.semana = semana;

console.log('✅ DEBUG: Configuração concluída');
console.log('  - msg.url:', msg.url);
console.log('  - msg.method:', msg.method);
console.log('  - msg.headers:', msg.headers);

return msg; 