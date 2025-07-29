require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
const OpenAI = require('openai');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lista de signos com nomes em português
const signos = {
  aries: "Áries",
  taurus: "Touro", 
  gemini: "Gêmeos",
  cancer: "Câncer",
  leo: "Leão",
  virgo: "Virgem",
  libra: "Libra",
  scorpio: "Escorpião",
  sagittarius: "Sagitário",
  capricorn: "Capricórnio",
  aquarius: "Aquário",
  pisces: "Peixes"
};

// Função para obter chave da semana
function getWeekKey(date = new Date()) {
  const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Função para obter chave da próxima semana
function getNextWeekKey() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return getWeekKey(nextWeek);
}

// Função para gerar horóscopo de um signo
async function gerarHoroscopoSigno(signo, nomeSigno) {
  try {
    console.log(`🔮 Gerando horóscopo para ${nomeSigno}...`);
    
    const prompt = `Gere um horóscopo semanal detalhado para ${nomeSigno} em português brasileiro.

REQUISITOS:
- Linguagem acessível e motivacional
- Foco em aspectos práticos da vida
- Tom positivo e encorajador
- Sem previsões negativas ou alarmistas

MENSAGEM DE ÁUDIO (Catia Fonseca):
- Tom caloroso e pessoal, como se estivesse conversando diretamente
- Linguagem próxima e motivacional
- Use expressões características da Catia
- Máximo 400 caracteres

ESTRUTURA OBRIGATÓRIA (JSON):
{
  "destaque": {
    "titulo": "Título da semana (máximo 50 caracteres)",
    "mensagem": "Mensagem principal da semana (máximo 200 caracteres)",
    "mensagem_audio": "Mensagem personalizada da Catia Fonseca para narração (máximo 400 caracteres, tom caloroso e pessoal, como se estivesse conversando diretamente com a pessoa, use linguagem próxima e motivacional)",
    "tema": "Tema principal (ex: Oportunidade, Afeto, Transformação)",
    "cor": "#8B5CF6"
  },
  "segunda": {
    "tema": "Tema do dia",
    "trecho": "Previsão para segunda-feira (máximo 100 caracteres)",
    "icone": "FaStar",
    "cor": "#F59E0B"
  },
  "terca": {
    "tema": "Tema do dia", 
    "trecho": "Previsão para terça-feira (máximo 100 caracteres)",
    "icone": "FaRegHeart",
    "cor": "#EC4899"
  },
  "quarta": {
    "tema": "Tema do dia",
    "trecho": "Previsão para quarta-feira (máximo 100 caracteres)", 
    "icone": "FaRegEdit",
    "cor": "#10B981"
  },
  "quinta": {
    "tema": "Tema do dia",
    "trecho": "Previsão para quinta-feira (máximo 100 caracteres)",
    "icone": "BsFillSunFill", 
    "cor": "#F97316"
  },
    "sexta": {
    "tema": "Tema do dia",
    "trecho": "Previsão para sexta-feira (máximo 100 caracteres)",
    "icone": "BsFillMoonStarsFill",
    "cor": "#3B82F6"
  },
  "sabado": {
    "tema": "Tema do dia",
    "trecho": "Previsão para sábado (máximo 100 caracteres)",
    "icone": "FaStar",
    "cor": "#6366F1"
  },
  "domingo": {
    "tema": "Tema do dia", 
    "trecho": "Previsão para domingo (máximo 100 caracteres)",
    "icone": "GiPlanetConquest",
    "cor": "#8B5CF6"
  }
}

TEMAS SUGERIDOS: Oportunidade, Afeto, Comunicação, Expansão, Reflexão, Descanso, Intuição, Transformação, Movimento, Criatividade, Harmonia, Sabedoria

CORES SUGERIDAS: #8B5CF6 (roxo), #F59E0B (amarelo), #EC4899 (rosa), #10B981 (verde), #F97316 (laranja), #3B82F6 (azul), #6366F1 (índigo)

ICONES DISPONÍVEIS: FaStar, FaRegHeart, FaRegEdit, BsFillSunFill, BsFillMoonStarsFill, GiPlanetConquest, FaRegSmile, FaRegLightbulb, FaRegGem, FaRegCompass, FaRegEye, FaRegHandPeace, FaRegClock, FaRegCalendarAlt, FaRegUser, FaRegBookmark, FaRegBell, FaRegGift, FaRegTrophy, FaRegFire, FaRegLeaf, FaRegWater, FaRegMountain, FaRegTree, FaRegCloud, FaRegMoon, FaRegSun, FaRegStar, FaRegHeart, FaRegSmile, FaRegLightbulb, FaRegGem, FaRegCompass, FaRegEye, FaRegHandPeace, FaRegClock, FaRegCalendarAlt, FaRegUser, FaRegBookmark, FaRegBell, FaRegGift, FaRegTrophy, FaRegFire, FaRegLeaf, FaRegWater, FaRegMountain, FaRegTree, FaRegCloud, FaRegMoon, FaRegSun, FaRegStar

IMPORTANTE: Use ícones diferentes para cada dia da semana. Escolha ícones que combinem com o tema do dia.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo especializado em horóscopos semanais. Sempre retorne JSON válido e use linguagem positiva e motivacional."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const horoscopoTexto = response.choices[0].message.content;
    
    // Tentar extrair JSON da resposta
    let horoscopo;
    try {
      // Remover possíveis marcadores de código
      const jsonMatch = horoscopoTexto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        horoscopo = JSON.parse(jsonMatch[0]);
      } else {
        horoscopo = JSON.parse(horoscopoTexto);
      }
    } catch (parseError) {
      console.error(`❌ Erro ao fazer parse do JSON para ${nomeSigno}:`, parseError);
      console.error('Resposta da OpenAI:', horoscopoTexto);
      throw new Error(`Erro no parse do JSON para ${nomeSigno}`);
    }

    // Adicionar metadados
    horoscopo.created_at = new Date();
    horoscopo.updated_at = new Date();
    horoscopo.status = 'ativo';
    horoscopo.signo = signo;
    horoscopo.nome_signo = nomeSigno;

    console.log(`✅ Horóscopo gerado para ${nomeSigno}`);
    return horoscopo;

  } catch (error) {
    console.error(`❌ Erro ao gerar horóscopo para ${nomeSigno}:`, error);
    throw error;
  }
}

// Função principal para gerar todos os horóscopos
async function gerarTodosHoroscopos(force = false) {
  try {
    console.log('🚀 Iniciando geração de horóscopos semanais...');
    console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
    
    // Verificar se OpenAI está configurada
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('❌ OpenAI API Key não configurada! Configure OPENAI_API_KEY no arquivo .env');
    }

    const semanaAtual = getWeekKey();
    const proximaSemana = getNextWeekKey();
    
    console.log(`📅 Semana atual: ${semanaAtual}`);
    console.log(`📅 Próxima semana: ${proximaSemana}`);
    console.log('');

    // Verificar se já existe horóscopo para a semana atual
    const configDoc = await getDoc(doc(db, 'horoscopos_semanais', 'config'));
    if (configDoc.exists() && !force) {
      const config = configDoc.data();
      if (config.semanas_ativas && config.semanas_ativas.includes(semanaAtual)) {
        console.log(`⚠️  Horóscopos para ${semanaAtual} já existem. Pulando...`);
        console.log('💡 Use --force para regenerar');
        return;
      }
    }
    
    if (force) {
      console.log('🔄 Modo force ativado - regenerando horóscopos...');
    }

    // Gerar horóscopos para todos os signos
    const resultados = [];
    const erros = [];

    for (const [signo, nomeSigno] of Object.entries(signos)) {
      try {
        const horoscopo = await gerarHoroscopoSigno(signo, nomeSigno);
        
        // Salvar no Firebase
        await setDoc(doc(db, 'horoscopos_semanais', semanaAtual, 'signos', signo), horoscopo);
        
        resultados.push({ signo, nomeSigno, status: 'sucesso' });
        
        // Aguardar um pouco para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Falha ao gerar horóscopo para ${nomeSigno}:`, error);
        erros.push({ signo, nomeSigno, erro: error.message });
      }
    }

    // Atualizar configuração
    await setDoc(doc(db, 'horoscopos_semanais', 'config'), {
      ultima_geracao: new Date(),
      proxima_geracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ativo',
      total_signos: Object.keys(signos).length,
      semanas_ativas: [semanaAtual, proximaSemana],
      ultima_execucao: new Date()
    });

    // Relatório final
    console.log('');
    console.log('📊 RELATÓRIO DE GERAÇÃO:');
    console.log(`✅ Sucessos: ${resultados.length}`);
    console.log(`❌ Erros: ${erros.length}`);
    console.log(`📅 Semana gerada: ${semanaAtual}`);
    
    if (erros.length > 0) {
      console.log('');
      console.log('❌ Signos com erro:');
      erros.forEach(erro => {
        console.log(`  - ${erro.nomeSigno}: ${erro.erro}`);
      });
    }

    console.log('');
    console.log('🎉 Geração de horóscopos concluída!');

  } catch (error) {
    console.error('❌ Erro na geração de horóscopos:', error);
    throw error;
  }
}

// Função para verificar status
async function verificarStatus() {
  try {
    console.log('🔍 Verificando status dos horóscopos...');
    
    const configDoc = await getDoc(doc(db, 'horoscopos_semanais', 'config'));
    if (configDoc.exists()) {
      const config = configDoc.data();
      console.log('📊 Status atual:');
      console.log(`  - Última geração: ${config.ultima_geracao?.toDate().toLocaleString('pt-BR')}`);
      console.log(`  - Próxima geração: ${config.proxima_geracao?.toDate().toLocaleString('pt-BR')}`);
      console.log(`  - Status: ${config.status}`);
      console.log(`  - Total de signos: ${config.total_signos}`);
      console.log(`  - Semanas ativas: ${config.semanas_ativas?.join(', ')}`);
    } else {
      console.log('❌ Configuração não encontrada');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
}

// Executar baseado no comando
if (require.main === module) {
  const comando = process.argv[2];
  const signo = process.argv[3];
  const force = process.argv.includes('--force');
  
  switch (comando) {
    case 'gerar':
      if (force) {
        console.log('�� Modo force ativado - regenerando horóscopos semanais...');
        // Limpar cache e regenerar
        gerarTodosHoroscopos(true);
      } else {
        gerarTodosHoroscopos();
      }
      break;
    case 'status':
      verificarStatus();
      break;
    case 'signo':
      if (!signo) {
        console.log('❌ Especifique o signo: node gerar-horoscopos-semanais.js signo <signo>');
        break;
      }
      if (!signos[signo]) {
        console.log(`❌ Signo inválido: ${signo}. Signos válidos: ${Object.keys(signos).join(', ')}`);
        break;
      }
      console.log(`🔮 Testando geração para ${signos[signo]}...`);
      gerarHoroscopoSigno(signo, signos[signo])
        .then(horoscopo => {
          console.log('✅ Horóscopo gerado:');
          console.log(JSON.stringify(horoscopo, null, 2));
        })
        .catch(error => {
          console.error('❌ Erro:', error);
        });
      break;
    default:
      console.log('📋 Comandos disponíveis:');
      console.log('  node gerar-horoscopos-semanais.js gerar  - Gerar horóscopos');
      console.log('  node gerar-horoscopos-semanais.js gerar --force  - Forçar regeneração');
      console.log('  node gerar-horoscopos-semanais.js status - Verificar status');
      console.log('  node gerar-horoscopos-semanais.js signo <s> - Testar signo específico');
  }
}

module.exports = {
  gerarTodosHoroscopos,
  verificarStatus,
  gerarHoroscopoSigno
}; 