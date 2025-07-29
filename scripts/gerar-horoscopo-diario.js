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

// Função para obter chave do dia
function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para obter nome do dia da semana
function getDayName(date = new Date()) {
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return dias[date.getDay()];
}

// Função para gerar horóscopo diário de um signo
async function gerarHoroscopoDiario(signo, nomeSigno) {
  try {
    const hoje = new Date();
    const diaSemana = getDayName(hoje);
    
    console.log(`🔮 Gerando horóscopo diário para ${nomeSigno} (${diaSemana})...`);
    
    const prompt = `Você é um astrologo que vai fazer a previsão do dia de hoje (${diaSemana}) para o signo ${nomeSigno}, e usar o mesmo tom de voz da apresentadora Catia Fonseca, vai finalizar a frase com um emoji e usar até 220 caracteres.

REQUISITOS:
- Tom de voz da Catia Fonseca (carismática, calorosa, próxima)
- Linguagem acessível e motivacional
- Foco no dia de hoje (${diaSemana})
- Máximo 220 caracteres
- Finalizar com emoji
- Sem previsões negativas

EXEMPLO DE TOM:
"Oi, ${nomeSigno}! Hoje é um dia especial para você. As energias estão alinhadas e você vai se surpreender com as oportunidades que aparecem no seu caminho. Confie na sua intuição! ✨"

IMPORTANTE: Retorne APENAS o texto da previsão, sem aspas ou formatação adicional.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é a apresentadora Catia Fonseca, especialista em astrologia. Use um tom carismático, caloroso e próximo. Sempre seja positiva e motivacional."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    let horoscopoTexto = response.choices[0].message.content.trim();
    
    // Verificar se tem emoji
    if (!/\p{Emoji}/u.test(horoscopoTexto)) {
      console.warn(`⚠️ Horóscopo para ${nomeSigno} não tem emoji, adicionando...`);
      horoscopoTexto += ' ✨';
    }

    // Verificar tamanho - apenas se for realmente muito longo
    if (horoscopoTexto.length > 400) {
      console.warn(`⚠️ Horóscopo para ${nomeSigno} muito longo (${horoscopoTexto.length} chars), truncando inteligentemente...`);
      // Truncar em uma palavra completa, não no meio
      const truncated = horoscopoTexto.substring(0, 397);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 350) {
        horoscopoTexto = truncated.substring(0, lastSpace) + '...';
      } else {
        horoscopoTexto = truncated + '...';
      }
      console.log(`📝 Texto truncado para ${horoscopoTexto.length} caracteres`);
    } else {
      console.log(`✅ Texto com ${horoscopoTexto.length} caracteres (dentro do limite)`);
    }

    const horoscopo = {
      mensagem: horoscopoTexto,
      signo: signo,
      nome_signo: nomeSigno,
      dia_semana: diaSemana,
      data: hoje.toISOString().split('T')[0],
      created_at: new Date(),
      updated_at: new Date(),
      status: 'ativo',
      fonte: 'catia-fonseca'
    };

    console.log(`✅ Horóscopo diário gerado para ${nomeSigno}: "${horoscopoTexto}"`);
    return horoscopo;

  } catch (error) {
    console.error(`❌ Erro ao gerar horóscopo diário para ${nomeSigno}:`, error);
    throw error;
  }
}

// Função para salvar horóscopo no Firebase
async function salvarHoroscopoDiario(horoscopo) {
  try {
    const diaKey = getDayKey();
    const docRef = doc(db, 'horoscopos_diarios', diaKey, 'signos', horoscopo.signo);
    
    await setDoc(docRef, horoscopo);
    console.log(`💾 Horóscopo salvo no Firebase: ${diaKey}/${horoscopo.signo}`);
    
  } catch (error) {
    console.error(`❌ Erro ao salvar horóscopo para ${horoscopo.signo}:`, error);
    throw error;
  }
}

// Função principal para gerar todos os horóscopos diários
async function gerarTodosHoroscoposDiarios(force = false) {
  try {
    console.log('🚀 Iniciando geração de horóscopos diários...');
    console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
    
    // Verificar se OpenAI está configurada
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('❌ OpenAI API Key não configurada! Configure OPENAI_API_KEY no arquivo .env');
    }

    const diaAtual = getDayKey();
    console.log(`📅 Dia atual: ${diaAtual}`);
    console.log('');

    // Verificar se já existe horóscopo para hoje
    try {
      const configDoc = await getDoc(doc(db, 'horoscopos_diarios', diaAtual, 'config', 'status'));
      if (configDoc.exists() && !force) {
        console.log('⚠️ Horóscopos diários já existem para hoje!');
        console.log('💡 Use --force para regenerar');
        return;
      }
      if (force) {
        console.log('🔄 Modo force ativado - regenerando horóscopos...');
      }
    } catch (error) {
      // Documento não existe, continuar
    }

    console.log('🔮 Gerando horóscopos para todos os signos...');
    console.log('');

    // Gerar horóscopos para todos os signos
    const promises = Object.entries(signos).map(async ([signo, nomeSigno]) => {
      try {
        const horoscopo = await gerarHoroscopoDiario(signo, nomeSigno);
        await salvarHoroscopoDiario(horoscopo);
        return { signo, success: true };
      } catch (error) {
        console.error(`❌ Falha ao gerar horóscopo para ${nomeSigno}:`, error);
        return { signo, success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    
    // Salvar status da geração
    const statusDoc = {
      data: diaAtual,
      total_signos: Object.keys(signos).length,
      sucessos: results.filter(r => r.success).length,
      falhas: results.filter(r => !r.success).length,
      created_at: new Date(),
      status: 'concluido'
    };

    await setDoc(doc(db, 'horoscopos_diarios', diaAtual, 'config', 'status'), statusDoc);

    // Relatório final
    console.log('');
    console.log('📊 RELATÓRIO FINAL:');
    console.log(`✅ Sucessos: ${statusDoc.sucessos}`);
    console.log(`❌ Falhas: ${statusDoc.falhas}`);
    console.log(`📅 Data: ${diaAtual}`);
    console.log('');
    console.log('🎉 Geração de horóscopos diários concluída!');

  } catch (error) {
    console.error('❌ Erro na geração de horóscopos diários:', error);
    throw error;
  }
}

// Função para verificar status
async function verificarStatus() {
  try {
    const diaAtual = getDayKey();
    console.log(`📅 Verificando status para: ${diaAtual}`);
    
    const statusDoc = await getDoc(doc(db, 'horoscopos_diarios', diaAtual, 'config', 'status'));
    
    if (statusDoc.exists()) {
      const status = statusDoc.data();
      console.log('✅ Horóscopos diários existem para hoje!');
      console.log(`📊 Total: ${status.total_signos} signos`);
      console.log(`✅ Sucessos: ${status.sucessos}`);
      console.log(`❌ Falhas: ${status.falhas}`);
      console.log(`🕐 Criado em: ${status.created_at.toDate().toLocaleString('pt-BR')}`);
    } else {
      console.log('❌ Nenhum horóscopo diário encontrado para hoje');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
}

// Função para gerar horóscopo de um signo específico
async function gerarHoroscopoSignoEspecifico(signo) {
  try {
    if (!signos[signo]) {
      throw new Error(`Signo inválido: ${signo}. Signos válidos: ${Object.keys(signos).join(', ')}`);
    }

    console.log(`🔮 Gerando horóscopo diário para ${signos[signo]}...`);
    
    const horoscopo = await gerarHoroscopoDiario(signo, signos[signo]);
    await salvarHoroscopoDiario(horoscopo);
    
    console.log(`✅ Horóscopo gerado com sucesso para ${signos[signo]}!`);
    
  } catch (error) {
    console.error(`❌ Erro ao gerar horóscopo para ${signo}:`, error);
    throw error;
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'gerar':
    const force = args.includes('--force');
    gerarTodosHoroscoposDiarios(force);
    break;
    
  case 'status':
    verificarStatus();
    break;
    
  case 'signo':
    const signo = args[1];
    if (!signo) {
      console.error('❌ Especifique o signo: npm run diario:signo <signo>');
      process.exit(1);
    }
    gerarHoroscopoSignoEspecifico(signo);
    break;
    
  default:
    console.log('📋 COMANDOS DISPONÍVEIS:');
    console.log('  npm run diario:gerar     - Gerar horóscopos para todos os signos');
    console.log('  npm run diario:gerar --force - Forçar regeneração');
    console.log('  npm run diario:status    - Verificar status da geração');
    console.log('  npm run diario:signo <s> - Gerar horóscopo para signo específico');
    console.log('');
    console.log('📝 EXEMPLOS:');
    console.log('  npm run diario:gerar');
    console.log('  npm run diario:gerar --force');
    console.log('  npm run diario:status');
    console.log('  npm run diario:signo aries');
    break;
} 