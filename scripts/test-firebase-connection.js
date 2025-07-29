require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

async function testarConexao() {
  try {
    console.log('🔍 Testando conexão com Firebase...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    const requiredEnvVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN', 
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID'
    ];
    
    console.log('📋 Verificando variáveis de ambiente:');
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        console.log(`  ✅ ${envVar}: ${value.substring(0, 10)}...`);
      } else {
        console.log(`  ❌ ${envVar}: NÃO CONFIGURADA`);
        return false;
      }
    }
    
    // Inicializar Firebase
    console.log('🚀 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Testar conexão tentando listar coleções
    console.log('📡 Testando conexão com Firestore...');
    const collections = await getDocs(collection(db, 'horoscopos_semanais'));
    
    console.log('✅ Conexão com Firebase estabelecida com sucesso!');
    console.log(`📊 Total de documentos na coleção: ${collections.size}`);
    
    // Listar documentos encontrados
    if (collections.size > 0) {
      console.log('📄 Documentos encontrados:');
      collections.forEach(doc => {
        console.log(`  - ${doc.id}`);
      });
    } else {
      console.log('📄 Nenhum documento encontrado (normal para primeira execução)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao conectar com Firebase:', error);
    console.error('💡 Verifique:');
    console.error('  1. Se as variáveis de ambiente estão configuradas');
    console.error('  2. Se o projeto Firebase existe');
    console.error('  3. Se as regras do Firestore permitem leitura');
    return false;
  }
}

// Executar teste
if (require.main === module) {
  testarConexao().then(success => {
    if (success) {
      console.log('🎉 Teste concluído com sucesso!');
      process.exit(0);
    } else {
      console.log('💥 Teste falhou!');
      process.exit(1);
    }
  });
}

module.exports = { testarConexao }; 