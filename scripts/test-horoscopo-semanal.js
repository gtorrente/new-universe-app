// Teste completo do horóscopo semanal
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

// Função para obter chave da semana (igual ao frontend)
function getWeekKey(date = new Date()) {
  const now = new Date(date);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

async function testarHoroscopoSemanal() {
  try {
    console.log('🧪 TESTE DO HORÓSCOPO SEMANAL');
    console.log('');
    
    const weekKey = getWeekKey();
    console.log(`📅 Semana calculada: ${weekKey}`);
    
    const signos = ['aries', 'taurus', 'gemini', 'cancer'];
    
    for (const signo of signos) {
      console.log(`\n🔍 Testando ${signo}...`);
      
      try {
        // Buscar exatamente como o frontend faz
        const horoscopoRef = doc(db, 'horoscopos_semanais', weekKey, 'signos', signo);
        const horoscopoSnap = await getDoc(horoscopoRef);
        
        if (!horoscopoSnap.exists()) {
          console.log(`❌ ${signo}: Documento não encontrado`);
          continue;
        }

        const h = horoscopoSnap.data();
        console.log(`✅ ${signo}: Documento encontrado`);
        
        // Verificar estrutura como o frontend faz
        const destaque = h.destaque || { titulo: 'Previsão Semanal', mensagem: 'Confira sua semana!', icone: 'FaStar' };
        const semanaFormatada = [
          { dia: 'Seg', tema: h.segunda?.tema, trecho: h.segunda?.trecho, icone: h.segunda?.icone },
          { dia: 'Ter', tema: h.terca?.tema, trecho: h.terca?.trecho, icone: h.terca?.icone },
          { dia: 'Qua', tema: h.quarta?.tema, trecho: h.quarta?.trecho, icone: h.quarta?.icone },
          { dia: 'Qui', tema: h.quinta?.tema, trecho: h.quinta?.trecho, icone: h.quinta?.icone },
          { dia: 'Sex', tema: h.sexta?.tema, trecho: h.sexta?.trecho, icone: h.sexta?.icone },
          { dia: 'Sáb', tema: h.sabado?.tema, trecho: h.sabado?.trecho, icone: h.sabado?.icone },
          { dia: 'Dom', tema: h.domingo?.tema, trecho: h.domingo?.trecho, icone: h.domingo?.icone },
        ];

        console.log(`📝 Destaque: ${destaque.titulo}`);
        console.log(`📅 Dias da semana: ${semanaFormatada.length} encontrados`);
        
        // Verificar se há dados válidos
        const diasComDados = semanaFormatada.filter(dia => dia.tema && dia.trecho);
        console.log(`✅ Dias com dados válidos: ${diasComDados.length}/7`);
        
        if (diasComDados.length === 0) {
          console.log(`⚠️  ${signo}: Dados encontrados mas sem conteúdo nos dias`);
        }
        
      } catch (error) {
        console.log(`❌ ${signo}: Erro - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testarHoroscopoSemanal();