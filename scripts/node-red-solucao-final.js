// SOLUÇÃO FINAL - CÓDIGO HARDCODED PARA NODE-RED
// Adicione este código no Function node "Processar Requisicao"

console.log('🚀 INICIANDO PROCESSAMENTO (SOLUÇÃO FINAL)...');

// Configuração do Firebase (hardcoded para garantir funcionamento)
const PROJECT_ID = "tarot-universo-catia";

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

if (!sign) {
  console.error('❌ Signo não especificado');
  msg.payload = {
    success: false,
    error: "Signo não especificado",
    message: "Parâmetro 'sign' é obrigatório"
  };
  return msg;
}

console.log(`📥 Processando signo: ${sign}`);

// Gerar URL do Firebase (hardcoded)
const semanaAtual = getWeekKey();
const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/horoscopos_semanais/${semanaAtual}/signos/${sign}`;

console.log(`🌐 URL gerada: ${url}`);

// Configurar requisição HTTP
msg.url = url;
msg.method = 'GET';
msg.headers = {
  'Content-Type': 'application/json'
};

// Armazenar informações adicionais
msg.isSemanal = msg.req?.url?.includes('horoscopo-semanal');
msg.signo = sign;
msg.semana = semanaAtual;

console.log('✅ Configuração concluída. URL definida:', msg.url);

return msg; 