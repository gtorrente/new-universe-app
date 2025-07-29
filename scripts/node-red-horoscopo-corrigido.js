// CÓDIGO CORRIGIDO PARA NODE-RED - API de Horóscopos do Firebase
// Adicione este código em um Function node no Node-RED

// Configuração do Firebase (usar variáveis de ambiente do Node-RED)
const firebaseConfig = {
  apiKey: env.get('FIREBASE_API_KEY'),
  authDomain: env.get('FIREBASE_AUTH_DOMAIN'),
  projectId: env.get('FIREBASE_PROJECT_ID'),
  storageBucket: env.get('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER_ID'),
  appId: env.get('FIREBASE_APP_ID')
};

// Função para obter chave da semana atual
function getWeekKey() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Função principal para processar requisições
function processarRequisicao() {
  try {
    const { sign } = msg.payload;
    
    if (!sign) {
      return {
        success: false,
        error: "Signo não especificado",
        message: "Parâmetro 'sign' é obrigatório"
      };
    }
    
    console.log(`📥 Requisição recebida para signo: ${sign}`);
    
    // Verificar se PROJECT_ID está configurado
    if (!firebaseConfig.projectId) {
      console.error('❌ FIREBASE_PROJECT_ID não configurado!');
      return {
        success: false,
        error: "Configuração do Firebase incompleta",
        message: "FIREBASE_PROJECT_ID não configurado"
      };
    }
    
    // Configurar URL do Firebase
    const semanaAtual = getWeekKey();
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/horoscopos_semanais/${semanaAtual}/signos/${sign}`;
    
    console.log(`🌐 URL do Firebase: ${url}`);
    
    // Configurar requisição HTTP
    msg.url = url;
    msg.method = 'GET';
    msg.headers = {
      'Content-Type': 'application/json'
    };
    
    // Armazenar informações para processamento posterior
    msg.isSemanal = msg.req?.url?.includes('horoscopo-semanal');
    msg.signo = sign;
    msg.semana = semanaAtual;
    
    return msg;
    
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    return {
      success: false,
      error: error.message,
      message: "Erro interno do servidor"
    };
  }
}

// Executar função principal
return processarRequisicao(); 