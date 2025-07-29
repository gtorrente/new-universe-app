// CÓDIGO CORRIGIDO - RESOLVE "No url specified"
// Adicione este código no Function node "Processar Requisicao"

console.log('🔍 INICIANDO PROCESSAMENTO...');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: env.get('FIREBASE_API_KEY'),
  authDomain: env.get('FIREBASE_AUTH_DOMAIN'),
  projectId: env.get('FIREBASE_PROJECT_ID'),
  storageBucket: env.get('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER_ID'),
  appId: env.get('FIREBASE_APP_ID')
};

console.log('📋 Configuração Firebase:', {
  apiKey: firebaseConfig.apiKey ? '✅' : '❌',
  authDomain: firebaseConfig.authDomain ? '✅' : '❌',
  projectId: firebaseConfig.projectId ? '✅' : '❌',
  storageBucket: firebaseConfig.storageBucket ? '✅' : '❌',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅' : '❌',
  appId: firebaseConfig.appId ? '✅' : '❌'
});

// Função para obter chave da semana atual
function getWeekKey() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Verificar se PROJECT_ID está configurado
if (!firebaseConfig.projectId) {
  console.error('❌ FIREBASE_PROJECT_ID não configurado!');
  msg.payload = {
    success: false,
    error: "Configuração do Firebase incompleta",
    message: "FIREBASE_PROJECT_ID não configurado. Configure a variável de ambiente."
  };
  return msg;
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