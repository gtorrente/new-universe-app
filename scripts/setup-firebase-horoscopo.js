const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase (use suas credenciais)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// Estrutura de dados de exemplo para um signo
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

// Lista de signos
const signos = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Função para criar estrutura inicial
async function criarEstruturaInicial() {
  try {
    console.log('🚀 Iniciando criação da estrutura do Firebase...');
    
    const semanaAtual = getWeekKey();
    const proximaSemana = getNextWeekKey();
    
    console.log(`📅 Semana atual: ${semanaAtual}`);
    console.log(`📅 Próxima semana: ${proximaSemana}`);
    
    // Criar estrutura para a semana atual
    for (const signo of signos) {
      console.log(`📝 Criando estrutura para ${signo}...`);
      
      // Criar documento do signo na semana atual
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
        status: 'placeholder' // Indica que é estrutura temporária
      };
      
      await setDoc(doc(db, 'horoscopos_semanais', semanaAtual, 'signos', signo), dadosSigno);
    }
    
    // Criar estrutura para a próxima semana
    for (const signo of signos) {
      console.log(`📝 Criando estrutura para ${signo} (próxima semana)...`);
      
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
    await setDoc(doc(db, 'horoscopos_semanais', 'config'), {
      ultima_geracao: new Date(),
      proxima_geracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      status: 'ativo',
      total_signos: signos.length,
      semanas_ativas: [semanaAtual, proximaSemana]
    });
    
    console.log('✅ Estrutura criada com sucesso!');
    console.log(`📊 Total de signos configurados: ${signos.length}`);
    console.log(`📅 Semanas configuradas: ${semanaAtual}, ${proximaSemana}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar estrutura:', error);
    throw error;
  }
}

// Função para verificar se a estrutura existe
async function verificarEstrutura() {
  try {
    console.log('🔍 Verificando estrutura existente...');
    
    const configDoc = await getDocs(collection(db, 'horoscopos_semanais', 'config'));
    
    if (configDoc.empty) {
      console.log('❌ Estrutura não encontrada. Criando...');
      await criarEstruturaInicial();
    } else {
      console.log('✅ Estrutura já existe!');
      
      // Listar semanas disponíveis
      const semanas = await getDocs(collection(db, 'horoscopos_semanais'));
      console.log('📅 Semanas disponíveis:');
      semanas.forEach(doc => {
        if (doc.id !== 'config') {
          console.log(`  - ${doc.id}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
    throw error;
  }
}

// Função para limpar dados de teste
async function limparDadosTeste() {
  try {
    console.log('🧹 Limpando dados de teste...');
    
    const semanas = await getDocs(collection(db, 'horoscopos_semanais'));
    
    for (const semanaDoc of semanas.docs) {
      if (semanaDoc.id !== 'config') {
        const signos = await getDocs(collection(db, 'horoscopos_semanais', semanaDoc.id, 'signos'));
        
        for (const signoDoc of signos.docs) {
          const data = signoDoc.data();
          if (data.status === 'placeholder') {
            console.log(`🗑️ Removendo placeholder: ${semanaDoc.id}/${signoDoc.id}`);
            // Aqui você pode deletar ou marcar como removido
          }
        }
      }
    }
    
    console.log('✅ Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const comando = process.argv[2];
  
  switch (comando) {
    case 'criar':
      criarEstruturaInicial();
      break;
    case 'verificar':
      verificarEstrutura();
      break;
    case 'limpar':
      limparDadosTeste();
      break;
    default:
      console.log('📋 Comandos disponíveis:');
      console.log('  node setup-firebase-horoscopo.js criar    - Criar estrutura inicial');
      console.log('  node setup-firebase-horoscopo.js verificar - Verificar estrutura existente');
      console.log('  node setup-firebase-horoscopo.js limpar    - Limpar dados de teste');
  }
}

module.exports = {
  criarEstruturaInicial,
  verificarEstrutura,
  limparDadosTeste,
  getWeekKey,
  getNextWeekKey,
  signos
}; 