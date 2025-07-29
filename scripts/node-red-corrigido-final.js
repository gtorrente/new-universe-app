// CÓDIGO CORRIGIDO - RESOLVE URL E HEADERS
// Adicione este código no Function node "Processar Requisicao"

console.log('🚀 INICIANDO PROCESSAMENTO CORRIGIDO...');

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
  // IMPORTANTE: Não retornar aqui, apenas definir payload de erro
  msg.payload = {
    success: false,
    error: "Signo não especificado",
    message: "Parâmetro 'sign' é obrigatório"
  };
  // Continuar o fluxo para que o HTTP Request não seja executado
  return msg;
}

// Preparar variáveis para a URL
const semana = getWeekKey();
msg.semana = semana;
msg.signo = sign;

// IMPORTANTE: Definir headers apenas uma vez
msg.headers = {
  'Content-Type': 'application/json'
};

// Armazenar informações adicionais
msg.isSemanal = msg.req?.url?.includes('horoscopo-semanal');

// DEBUG: Verificar variáveis
console.log('🔍 DEBUG: Variáveis definidas:');
console.log('  - msg.semana:', msg.semana);
console.log('  - msg.signo:', msg.signo);
console.log('  - msg.headers:', msg.headers);

// DEBUG: Gerar URL completa para verificação
const urlCompleta = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_semanais/${msg.semana}/signos/${msg.signo}`;
console.log('🔍 DEBUG: URL completa que deveria ser gerada:');
console.log('  ', urlCompleta);

console.log('✅ DEBUG: Variáveis preparadas com sucesso');

// IMPORTANTE: Retornar apenas uma vez
return msg; 