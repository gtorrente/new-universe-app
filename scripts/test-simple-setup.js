require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

async function testSimpleSetup() {
  try {
    console.log('🚀 Testando setup simples...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Dados simples para teste
    const dadosTeste = {
      titulo: "Teste de Horóscopo",
      mensagem: "Esta é uma mensagem de teste",
      created_at: new Date(),
      status: 'teste'
    };
    
    console.log('📝 Criando documento de teste...');
    
    // Tentar criar um documento simples
    await setDoc(doc(db, 'teste', 'documento1'), dadosTeste);
    
    console.log('✅ Documento criado com sucesso!');
    
    // Agora tentar criar estrutura de horóscopo
    const dadosHoroscopo = {
      destaque: {
        titulo: "Semana de Teste",
        mensagem: "Mensagem de teste",
        tema: "Teste",
        cor: "#8B5CF6"
      },
      segunda: {
        tema: "Oportunidade",
        trecho: "Dia de teste",
        icone: "FaStar",
        cor: "#F59E0B"
      },
      created_at: new Date(),
      status: 'teste'
    };
    
    console.log('📝 Criando estrutura de horóscopo...');
    
    await setDoc(doc(db, 'horoscopos_semanais', 'teste-semana', 'signos', 'aries'), dadosHoroscopo);
    
    console.log('✅ Estrutura de horóscopo criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Detalhes do erro:', error.message);
    
    if (error.message.includes('INVALID_ARGUMENT')) {
      console.log('💡 Dica: Verifique se:');
      console.log('  1. As credenciais do Firebase estão corretas');
      console.log('  2. O projeto Firebase existe');
      console.log('  3. O Firestore está habilitado');
      console.log('  4. As regras do Firestore permitem escrita');
    }
  }
}

// Executar teste
if (require.main === module) {
  testSimpleSetup();
} 