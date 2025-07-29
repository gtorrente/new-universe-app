// CÓDIGO NODE-RED FINAL - VERSÃO SIMPLIFICADA
// Cole este código COMPLETO no Function node "Processar Requisicao Diario"
// SUBSTITUA todo o código existente por este

console.log('🚀 INICIANDO PROCESSAMENTO FINAL...');

// Extrair signo da requisição
const { sign } = msg.payload;

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

// LÓGICA SIMPLIFICADA DE DATA
const agora = new Date();
const horaBrasil = agora.getHours() - 3; // UTC-3 (horário de Brasília)

console.log('🕐 Hora Brasil calculada:', horaBrasil);

let diaChave;

// Se for madrugada (0-5h), usar dia anterior
if (horaBrasil >= 0 && horaBrasil <= 5) {
  console.log('🌙 Madrugada - usando dia anterior');
  const ontem = new Date(agora);
  ontem.setDate(ontem.getDate() - 1);
  
  const year = ontem.getFullYear();
  const month = (ontem.getMonth() + 1).toString().padStart(2, '0');
  const day = ontem.getDate().toString().padStart(2, '0');
  diaChave = `${year}-${month}-${day}`;
} else {
  console.log('☀️ Horário normal - usando dia atual');
  const year = agora.getFullYear();
  const month = (agora.getMonth() + 1).toString().padStart(2, '0');
  const day = agora.getDate().toString().padStart(2, '0');
  diaChave = `${year}-${month}-${day}`;
}

console.log('📅 Dia chave FINAL:', diaChave);

// Gerar URL
const urlCompleta = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaChave}/signos/${sign}`;

console.log('🔗 URL FINAL:', urlCompleta);

// Configurar mensagem
msg.url = urlCompleta;
msg.method = 'GET';
msg.headers = {
  'Content-Type': 'application/json'
};

msg.isSemanal = false;
msg.signo = sign;
msg.dia = diaChave;

console.log('✅ CONFIGURAÇÃO FINAL CONCLUÍDA');

return msg; 