require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

// Função para obter chave da próxima semana
function getNextWeekKey() {
  const now = new Date();
  const nextWeek = new Date(now.setDate(now.getDate() + 7));
  const startOfNextWeek = new Date(nextWeek.setDate(nextWeek.getDate() - nextWeek.getDay()));
  const year = startOfNextWeek.getFullYear();
  const weekNumber = Math.ceil((startOfNextWeek.getDate() + startOfNextWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Lista de signos
const signos = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Estrutura de dados de exemplo
const estruturaExemplo = {
  destaque: {
    titulo: "Semana de Transformações",
    mensagem: "Esta semana traz oportunidades únicas para crescimento pessoal e profissional.",
    tema: "Transformação",
    cor: "#8B5CF6"
  },
  segunda: {
    tema: "Oportunidade",
    trecho: "Dia ideal para iniciar novos projetos e buscar oportunidades.",
    icone: "FaStar",
    cor: "#F59E0B"
  },
  terca: {
    tema: "Afeto",
    trecho: "Momento para fortalecer relacionamentos e expressar sentimentos.",
    icone: "FaRegHeart",
    cor: "#EC4899"
  },
  quarta: {
    tema: "Comunicação",
    trecho: "Dia favorável para diálogos importantes e negociações.",
    icone: "FaRegEdit",
    cor: "#10B981"
  },
  quinta: {
    tema: "Expansão",
    trecho: "Período de crescimento e desenvolvimento de habilidades.",
    icone: "BsFillSunFill",
    cor: "#F97316"
  },
  sexta: {
    tema: "Reflexão",
    trecho: "Momento para avaliar conquistas e planejar próximos passos.",
    icone: "BsFillMoonStarsFill",
    cor: "#3B82F6"
  },
  sabado: {
    tema: "Descanso",
    trecho: "Dia para relaxar e recarregar energias para a próxima semana.",
    icone: "FaStar",
    cor: "#6366F1"
  },
  domingo: {
    tema: "Intuição",
    trecho: "Momento de conexão espiritual e insights importantes.",
    icone: "GiPlanetConquest",
    cor: "#8B5CF6"
  }
};

async function setupCompleto() {
  try {
    console.log('🚀 Iniciando setup completo dos horóscopos semanais...');
    console.log('⚠️  IMPORTANTE: Certifique-se de que aplicou as regras temporárias no Firebase!');
    console.log('');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const semanaAtual = getWeekKey();
    const proximaSemana = getNextWeekKey();
    
    console.log(`📅 Semana atual: ${semanaAtual}`);
    console.log(`📅 Próxima semana: ${proximaSemana}`);
    console.log('');
    
    // Criar estrutura para a semana atual
    console.log('📝 Criando estrutura para a semana atual...');
    for (const signo of signos) {
      console.log(`  - Criando ${signo}...`);
      
      const dadosSigno = {
        destaque: estruturaExemplo.destaque,
        segunda: estruturaExemplo.segunda,
        terca: estruturaExemplo.terca,
        quarta: estruturaExemplo.quarta,
        quinta: estruturaExemplo.quinta,
        sexta: estruturaExemplo.sexta,
        sabado: estruturaExemplo.sabado,
        domingo: estruturaExemplo.domingo,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'placeholder'
      };
      
      await setDoc(doc(db, 'horoscopos_semanais', semanaAtual, 'signos', signo), dadosSigno);
    }
    
    // Criar estrutura para a próxima semana
    console.log('📝 Criando estrutura para a próxima semana...');
    for (const signo of signos) {
      console.log(`  - Criando ${signo}...`);
      
      const dadosSignoProxima = {
        destaque: estruturaExemplo.destaque,
        segunda: estruturaExemplo.segunda,
        terca: estruturaExemplo.terca,
        quarta: estruturaExemplo.quarta,
        quinta: estruturaExemplo.quinta,
        sexta: estruturaExemplo.sexta,
        sabado: estruturaExemplo.sabado,
        domingo: estruturaExemplo.domingo,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'placeholder'
      };
      
      await setDoc(doc(db, 'horoscopos_semanais', proximaSemana, 'signos', signo), dadosSignoProxima);
    }
    
    // Criar configuração
    console.log('📝 Criando configuração...');
    await setDoc(doc(db, 'horoscopos_semanais', 'config'), {
      ultima_geracao: new Date(),
      proxima_geracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ativo',
      total_signos: signos.length,
      semanas_ativas: [semanaAtual, proximaSemana]
    });
    
    console.log('');
    console.log('✅ Estrutura criada com sucesso!');
    console.log(`📊 Total de signos configurados: ${signos.length}`);
    console.log(`📅 Semanas configuradas: ${semanaAtual}, ${proximaSemana}`);
    console.log('');
    console.log('🔒 PRÓXIMO PASSO: Aplique as regras finais no Firebase!');
    console.log('   - Use o arquivo: firestore-rules-final.rules');
    console.log('   - Vá em: Firebase Console > Firestore Database > Rules');
    console.log('   - Cole o conteúdo e clique em "Publish"');
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error);
    console.error('');
    console.error('💡 Possíveis soluções:');
    console.error('   1. Verifique se aplicou as regras temporárias');
    console.error('   2. Confirme se as credenciais do Firebase estão corretas');
    console.error('   3. Verifique se o Firestore está habilitado');
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupCompleto();
}

module.exports = { setupCompleto }; 