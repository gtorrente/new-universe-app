require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
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

// Lista de signos
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

// Função para obter chave do dia atual
function getDayKey(date = new Date()) {
  // Forçar fuso horário brasileiro
  const dataBR = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const year = dataBR.getFullYear();
  const month = (dataBR.getMonth() + 1).toString().padStart(2, '0');
  const day = dataBR.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para obter nome do dia da semana
function getDayName(date = new Date()) {
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const dataBR = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  return dias[dataBR.getDay()];
}

// Função para gerar horóscopo diário
async function gerarHoroscopoDiario(signo, nomeSigno) {
  try {
    const hoje = new Date();
    const diaSemana = getDayName(hoje);
    
    console.log(`🔮 Gerando horóscopo diário para ${nomeSigno} (${diaSemana})...`);
    
    const prompt = `Você é um astrologo que vai fazer a previsão do dia de hoje (${diaSemana}) para o signo ${nomeSigno}, e usar o mesmo tom de voz da apresentadora Catia Fonseca, vai finalizar a frase com um emoji e usar até 400 caracteres.

REQUISITOS:
- Tom de voz da Catia Fonseca (carismática, calorosa, próxima)
- Linguagem acessível e motivacional
- Foco no dia de hoje (${diaSemana})
- Máximo 400 caracteres
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
      max_tokens: 200
    });

    let horoscopoTexto = response.choices[0].message.content.trim();
    
    // Verificar se tem emoji
    if (!/\p{Emoji}/u.test(horoscopoTexto)) {
      console.warn(`⚠️ Horóscopo para ${nomeSigno} não tem emoji, adicionando...`);
      horoscopoTexto += ' ✨';
    }

    // Truncar se necessário
    if (horoscopoTexto.length > 400) {
      console.warn(`⚠️ Horóscopo para ${nomeSigno} muito longo (${horoscopoTexto.length} chars), truncando...`);
      const truncated = horoscopoTexto.substring(0, 397);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 350) {
        horoscopoTexto = truncated.substring(0, lastSpace) + '...';
      } else {
        horoscopoTexto = truncated + '...';
      }
    }

    console.log(`✅ Horóscopo gerado para ${nomeSigno} (${horoscopoTexto.length} caracteres)`);
    
    return {
      signo,
      nomeSigno,
      mensagem: horoscopoTexto,
      data: getDayKey(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Erro ao gerar horóscopo para ${nomeSigno}:`, error);
    throw error;
  }
}

// Função para salvar horóscopo no Firebase
async function salvarHoroscopoDiario(horoscopo) {
  try {
    const diaKey = horoscopo.data;
    const docRef = doc(db, 'horoscopos_diarios', diaKey, 'signos', horoscopo.signo);
    
    await setDoc(docRef, {
      horoscopo: {
        mensagem: horoscopo.mensagem,
        data: horoscopo.data,
        timestamp: horoscopo.timestamp
      }
    });
    
    console.log(`💾 Horóscopo salvo para ${horoscopo.nomeSigno}`);
    
  } catch (error) {
    console.error(`❌ Erro ao salvar horóscopo para ${horoscopo.nomeSigno}:`, error);
    throw error;
  }
}

// Função principal
async function gerarHoroscoposParaHoje() {
  try {
    console.log('🚀 Gerando horóscopos para hoje...');
    console.log('📅 Data:', new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'}));
    console.log('📅 Dia chave:', getDayKey());
    console.log('');

    // Gerar para todos os signos
    const promises = Object.entries(signos).map(async ([signo, nomeSigno]) => {
      try {
        const horoscopo = await gerarHoroscopoDiario(signo, nomeSigno);
        await salvarHoroscopoDiario(horoscopo);
        return { signo, success: true };
      } catch (error) {
        console.error(`❌ Falha para ${nomeSigno}:`, error.message);
        return { signo, success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    
    const sucessos = results.filter(r => r.success).length;
    const falhas = results.filter(r => !r.success).length;

    console.log('\n📊 RELATÓRIO:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Falhas: ${falhas}`);
    
    if (falhas > 0) {
      console.log('\n❌ Falhas detalhadas:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.signo}: ${r.error}`);
      });
    }

    console.log('\n🎉 Geração concluída!');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  gerarHoroscoposParaHoje()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = { gerarHoroscoposParaHoje, getDayKey }; 