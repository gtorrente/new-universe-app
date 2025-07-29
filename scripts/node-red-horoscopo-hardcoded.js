// CÓDIGO ALTERNATIVO - FUNCIONA SEM VARIÁVEIS DE AMBIENTE
// Adicione este código no Function node "Processar Requisicao"

console.log('🔍 INICIANDO PROCESSAMENTO (versão hardcoded)...');

// Configuração do Firebase (hardcoded para resolver o problema)
const firebaseConfig = {
  apiKey: "AIzaSyAVwBJ7dRTv_rClLq1uoWQ4jfTz9wcyxjI",
  authDomain: "tarot-universo-catia.firebaseapp.com",
  projectId: "tarot-universo-catia",
  storageBucket: "tarot-universo-catia.firebasestorage.app",
  messagingSenderId: "773283915668",
  appId: "1:773283915668:web:2a6f01401e646437191181"
};

console.log('📋 Configuração Firebase (hardcoded):', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

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

// Gerar URL do Firebase
const semanaAtual = getWeekKey();
const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/horoscopos_semanais/${semanaAtual}/signos/${sign}`;

console.log(`🌐 URL gerada: ${url}`);

// IMPORTANTE: Definir msg.url ANTES de retornar
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