// Script para gerar horóscopo do dia anterior (para resolver problema da madrugada)

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { credential } = require('firebase-admin');

// Inicializar Firebase Admin
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ FIREBASE_PROJECT_ID não configurado');
  process.exit(1);
}

const app = initializeApp({
  credential: credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = getFirestore(app);

// Configuração da OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY não configurado');
  process.exit(1);
}

// Função para obter chave do dia anterior
function getDayKeyOntem() {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1); // Dia anterior
  
  // Forçar fuso horário brasileiro
  const dataBR = new Date(ontem.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const year = dataBR.getFullYear();
  const month = (dataBR.getMonth() + 1).toString().padStart(2, '0');
  const day = dataBR.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Lista de signos
const signos = [
  { nome: 'Áries', en: 'aries' },
  { nome: 'Touro', en: 'taurus' },
  { nome: 'Gêmeos', en: 'gemini' },
  { nome: 'Câncer', en: 'cancer' },
  { nome: 'Leão', en: 'leo' },
  { nome: 'Virgem', en: 'virgo' },
  { nome: 'Libra', en: 'libra' },
  { nome: 'Escorpião', en: 'scorpio' },
  { nome: 'Sagitário', en: 'sagittarius' },
  { nome: 'Capricórnio', en: 'capricorn' },
  { nome: 'Aquário', en: 'aquarius' },
  { nome: 'Peixes', en: 'pisces' }
];

// Função para gerar horóscopo via OpenAI
async function gerarHoroscopo(signo, diaSemana) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Crie um horóscopo diário específico para ${signo} para ${diaSemana}. 

REQUISITOS:
- Máximo 400 caracteres
- Tom acolhedor e motivacional
- Mencione aspectos específicos do dia (amor, trabalho, saúde)
- Use linguagem brasileira natural
- Seja específico para ${signo}
- Inclua pelo menos uma orientação prática

Responda APENAS com o texto do horóscopo, sem introduções ou explicações.`
        }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    let horoscopo = data.choices[0].message.content.trim();

    // Garantir limite de caracteres
    if (horoscopo.length > 400) {
      console.log(`⚠️ Horóscopo para ${signo} muito longo (${horoscopo.length} chars), truncando...`);
      horoscopo = horoscopo.substring(0, 397) + '...';
    }

    console.log(`✅ Horóscopo gerado para ${signo} (${horoscopo.length} caracteres)`);
    return horoscopo;

  } catch (error) {
    console.error(`❌ Erro ao gerar horóscopo para ${signo}:`, error.message);
    throw error;
  }
}

// Função para salvar no Firestore
async function salvarHoroscopo(dayKey, signoEn, horoscopo) {
  try {
    const docRef = db.doc(`horoscopos_diarios/${dayKey}/signos/${signoEn}`);
    await docRef.set({
      horoscopo: {
        mensagem: horoscopo,
        gerado_em: new Date().toISOString(),
        tipo: 'diario'
      }
    });
    console.log(`💾 Horóscopo salvo para ${signoEn}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${signoEn}:`, error.message);
    throw error;
  }
}

// Função principal
async function gerarHoroscoposOntem() {
  const dayKey = getDayKeyOntem();
  const dataOntem = new Date();
  dataOntem.setDate(dataOntem.getDate() - 1);
  
  console.log('🚀 Gerando horóscopos para ONTEM...');
  console.log(`📅 Data: ${dataOntem.toLocaleDateString('pt-BR')}`);
  console.log(`📅 Dia chave: ${dayKey}`);
  
  const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const diaSemana = diasSemana[dataOntem.getDay()];

  const sucessos = [];
  const falhas = [];

  // Gerar horóscopos para todos os signos
  const promises = signos.map(async (signo) => {
    try {
      console.log(`🔮 Gerando horóscopo para ${signo.nome} (${diaSemana})...`);
      
      const horoscopo = await gerarHoroscopo(signo.nome, diaSemana);
      await salvarHoroscopo(dayKey, signo.en, horoscopo);
      
      sucessos.push(signo.nome);
    } catch (error) {
      console.error(`❌ Falha para ${signo.nome}:`, error.message);
      falhas.push({ signo: signo.nome, erro: error.message });
    }
  });

  await Promise.all(promises);

  console.log('\n📊 RELATÓRIO:');
  console.log(`✅ Sucessos: ${sucessos.length}`);
  console.log(`❌ Falhas: ${falhas.length}`);
  
  if (falhas.length > 0) {
    console.log('\n❌ Falhas detalhadas:');
    falhas.forEach(f => console.log(`  - ${f.signo}: ${f.erro}`));
  }

  console.log('\n🎉 Geração de horóscopos de ONTEM concluída!');
}

// Executar script
gerarHoroscoposOntem().catch(console.error); 