// SCRIPT PARA DEBUGAR NODE-RED
// Adicione este código em um Function node no Node-RED para verificar as variáveis

console.log('🔍 DEBUGANDO VARIÁVEIS DE AMBIENTE NO NODE-RED...');

// Verificar se as variáveis estão configuradas
const firebaseConfig = {
  apiKey: env.get('FIREBASE_API_KEY'),
  authDomain: env.get('FIREBASE_AUTH_DOMAIN'),
  projectId: env.get('FIREBASE_PROJECT_ID'),
  storageBucket: env.get('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER_ID'),
  appId: env.get('FIREBASE_APP_ID')
};

console.log('📋 Variáveis de ambiente:');
console.log('FIREBASE_API_KEY:', firebaseConfig.apiKey ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
console.log('FIREBASE_AUTH_DOMAIN:', firebaseConfig.authDomain ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
console.log('FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
console.log('FIREBASE_STORAGE_BUCKET:', firebaseConfig.storageBucket ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
console.log('FIREBASE_MESSAGING_SENDER_ID:', firebaseConfig.messagingSenderId ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
console.log('FIREBASE_APP_ID:', firebaseConfig.appId ? '✅ Configurada' : '❌ NÃO CONFIGURADA');

// Verificar se PROJECT_ID está correto
if (firebaseConfig.projectId) {
  console.log('📅 PROJECT_ID encontrado:', firebaseConfig.projectId);
  
  // Gerar URL de teste
  const semanaAtual = '2025-W04'; // Semana atual
  const signo = 'aries';
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/horoscopos_semanais/${semanaAtual}/signos/${signo}`;
  
  console.log('🌐 URL gerada:', url);
  
  // Retornar informações para debug
  msg.payload = {
    debug: true,
    firebaseConfig: firebaseConfig,
    url: url,
    semanaAtual: semanaAtual,
    signo: signo
  };
} else {
  console.log('❌ PROJECT_ID não encontrado!');
  msg.payload = {
    error: 'PROJECT_ID não configurado',
    firebaseConfig: firebaseConfig
  };
}

return msg; 