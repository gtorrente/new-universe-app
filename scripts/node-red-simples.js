// CÓDIGO SIMPLES - APENAS PREPARA VARIÁVEIS PARA URL
// Adicione este código no Function node "Processar Requisicao"

console.log('🚀 PROCESSAMENTO SIMPLES...');

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

// Preparar variáveis para a URL
msg.semana = getWeekKey();
msg.signo = sign;
msg.headers = {
  'Content-Type': 'application/json'
};

// Armazenar informações adicionais
msg.isSemanal = msg.req?.url?.includes('horoscopo-semanal');

console.log(`✅ Variáveis preparadas: semana=${msg.semana}, signo=${msg.signo}`);

return msg; 