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

// Função para obter chave da semana atual
function getWeekKey() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Lista de signos
const signos = ['aries', 'taurus', 'gemini'];

// Dados muito simples para teste
const dadosSimples = {
  destaque: {
    titulo: "Semana de Teste",
    mensagem: "Mensagem de teste simples",
    tema: "Teste"
  },
  segunda: {
    tema: "Oportunidade",
    trecho: "Dia de teste"
  },
  created_at: new Date(),
  status: 'teste'
};

async function setupSimples() {
  try {
    console.log('🚀 Testando setup simples...');
    
    // Verificar variáveis de ambiente
    console.log('📋 Verificando configuração...');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('API Key:', process.env.FIREBASE_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
    
    if (!process.env.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY === 'your_firebase_api_key_here') {
      throw new Error('❌ Credenciais do Firebase não configuradas! Configure o arquivo .env');
    }
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const semanaAtual = getWeekKey();
    console.log(`📅 Semana: ${semanaAtual}`);
    
    // Teste 1: Criar documento simples
    console.log('📝 Teste 1: Criando documento simples...');
    await setDoc(doc(db, 'teste', 'documento1'), {
      titulo: "Teste",
      created_at: new Date()
    });
    console.log('✅ Teste 1: Sucesso!');
    
    // Teste 2: Criar estrutura básica
    console.log('📝 Teste 2: Criando estrutura básica...');
    await setDoc(doc(db, 'horoscopos_semanais', semanaAtual, 'signos', 'aries'), dadosSimples);
    console.log('✅ Teste 2: Sucesso!');
    
    // Teste 3: Criar mais signos
    console.log('📝 Teste 3: Criando mais signos...');
    for (const signo of signos) {
      console.log(`  - Criando ${signo}...`);
      await setDoc(doc(db, 'horoscopos_semanais', semanaAtual, 'signos', signo), dadosSimples);
    }
    console.log('✅ Teste 3: Sucesso!');
    
    // Teste 4: Criar configuração
    console.log('📝 Teste 4: Criando configuração...');
    await setDoc(doc(db, 'horoscopos_semanais', 'config'), {
      ultima_geracao: new Date(),
      status: 'ativo',
      total_signos: signos.length
    });
    console.log('✅ Teste 4: Sucesso!');
    
    console.log('');
    console.log('🎉 Todos os testes passaram!');
    console.log('📊 Estrutura criada com sucesso');
    console.log(`📅 Semana: ${semanaAtual}`);
    console.log(`📝 Signos: ${signos.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    console.error('');
    console.error('💡 Possíveis soluções:');
    console.error('   1. Verifique se as credenciais do Firebase estão corretas');
    console.error('   2. Confirme se aplicou as regras temporárias');
    console.error('   3. Verifique se o Firestore está habilitado');
    console.error('   4. Teste a conexão: node test-firebase-connection.js');
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupSimples();
}

module.exports = { setupSimples }; 