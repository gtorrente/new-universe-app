require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Configuração do Firebase
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

// Função para buscar horóscopo do Firebase
async function buscarHoroscopo(signo) {
  try {
    console.log(`🔍 Buscando horóscopo para ${signo}...`);
    
    const semanaAtual = getWeekKey();
    console.log(`📅 Semana: ${semanaAtual}`);
    
    // Buscar documento do Firebase
    const docRef = doc(db, 'horoscopos_semanais', semanaAtual, 'signos', signo);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`✅ Horóscopo encontrado para ${signo}`);
      
      // Formatar dados para o formato esperado pela API
      const horoscopoFormatado = {
        destaque: {
          titulo: data.destaque?.titulo || "",
          mensagem: data.destaque?.mensagem || "",
          tema: data.destaque?.tema || "",
          cor: data.destaque?.cor || "#8B5CF6"
        },
        segunda: {
          tema: data.segunda?.tema || "",
          trecho: data.segunda?.trecho || "",
          icone: data.segunda?.icone || "FaStar",
          cor: data.segunda?.cor || "#F59E0B"
        },
        terca: {
          tema: data.terca?.tema || "",
          trecho: data.terca?.trecho || "",
          icone: data.terca?.icone || "FaRegHeart",
          cor: data.terca?.cor || "#EC4899"
        },
        quarta: {
          tema: data.quarta?.tema || "",
          trecho: data.quarta?.trecho || "",
          icone: data.quarta?.icone || "FaRegEdit",
          cor: data.quarta?.cor || "#10B981"
        },
        quinta: {
          tema: data.quinta?.tema || "",
          trecho: data.quinta?.trecho || "",
          icone: data.quinta?.icone || "BsFillSunFill",
          cor: data.quinta?.cor || "#F97316"
        },
        sexta: {
          tema: data.sexta?.tema || "",
          trecho: data.sexta?.trecho || "",
          icone: data.sexta?.icone || "BsFillMoonStarsFill",
          cor: data.sexta?.cor || "#3B82F6"
        },
        sabado: {
          tema: data.sabado?.tema || "",
          trecho: data.sabado?.trecho || "",
          icone: data.sabado?.icone || "FaStar",
          cor: data.sabado?.cor || "#6366F1"
        },
        domingo: {
          tema: data.domingo?.tema || "",
          trecho: data.domingo?.trecho || "",
          icone: data.domingo?.icone || "GiPlanetConquest",
          cor: data.domingo?.cor || "#8B5CF6"
        }
      };
      
      return {
        success: true,
        data: horoscopoFormatado,
        timestamp: new Date().toISOString()
      };
      
    } else {
      console.log(`❌ Horóscopo não encontrado para ${signo}`);
      return {
        success: false,
        error: "Horóscopo não encontrado",
        message: "Horóscopo não disponível para este signo/semana"
      };
    }
    
  } catch (error) {
    console.error(`❌ Erro ao buscar horóscopo para ${signo}:`, error);
    return {
      success: false,
      error: error.message,
      message: "Erro interno do servidor"
    };
  }
}

// Função para buscar horóscopo semanal
async function buscarHoroscopoSemanal(signo) {
  try {
    console.log(`🔍 Buscando horóscopo semanal para ${signo}...`);
    
    const resultado = await buscarHoroscopo(signo);
    
    if (resultado.success) {
      // Formatar dados para o formato esperado pelo frontend
      const semanaFormatada = [
        { dia: "Seg", ...resultado.data.segunda },
        { dia: "Ter", ...resultado.data.terca },
        { dia: "Qua", ...resultado.data.quarta },
        { dia: "Qui", ...resultado.data.quinta },
        { dia: "Sex", ...resultado.data.sexta },
        { dia: "Sáb", ...resultado.data.sabado },
        { dia: "Dom", ...resultado.data.domingo }
      ];
      
      return {
        success: true,
        data: {
          destaque: resultado.data.destaque,
          semana: semanaFormatada
        },
        timestamp: new Date().toISOString()
      };
    } else {
      return resultado;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao buscar horóscopo semanal para ${signo}:`, error);
    return {
      success: false,
      error: error.message,
      message: "Erro ao buscar horóscopo semanal"
    };
  }
}

// Função para simular API
async function simularAPI() {
  try {
    console.log('🚀 Testando API de horóscopos do Firebase...');
    console.log('');
    
    // Teste 1: Horóscopo diário
    console.log('📋 Teste 1: Horóscopo diário (aries)');
    const resultado1 = await buscarHoroscopo('aries');
    console.log('Resultado:', JSON.stringify(resultado1, null, 2));
    console.log('');
    
    // Teste 2: Horóscopo semanal
    console.log('📋 Teste 2: Horóscopo semanal (aries)');
    const resultado2 = await buscarHoroscopoSemanal('aries');
    console.log('Resultado:', JSON.stringify(resultado2, null, 2));
    console.log('');
    
    // Teste 3: Signo inexistente
    console.log('📋 Teste 3: Signo inexistente (teste)');
    const resultado3 = await buscarHoroscopo('teste');
    console.log('Resultado:', JSON.stringify(resultado3, null, 2));
    console.log('');
    
    console.log('✅ Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const comando = process.argv[2];
  const signo = process.argv[3];
  
  switch (comando) {
    case 'diario':
      if (signo) {
        buscarHoroscopo(signo).then(console.log);
      } else {
        console.log('❌ Especifique um signo: node test-firebase-api.js diario aries');
      }
      break;
    case 'semanal':
      if (signo) {
        buscarHoroscopoSemanal(signo).then(console.log);
      } else {
        console.log('❌ Especifique um signo: node test-firebase-api.js semanal aries');
      }
      break;
    case 'teste':
      simularAPI();
      break;
    default:
      console.log('📋 Comandos disponíveis:');
      console.log('  node test-firebase-api.js diario aries    - Testar horóscopo diário');
      console.log('  node test-firebase-api.js semanal aries   - Testar horóscopo semanal');
      console.log('  node test-firebase-api.js teste           - Executar todos os testes');
  }
}

module.exports = {
  buscarHoroscopo,
  buscarHoroscopoSemanal
}; 