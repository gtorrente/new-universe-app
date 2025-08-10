// Debug para verificar cálculo da semana
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

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

// Função do script de geração (correta)
function getWeekKeyScript(date = new Date()) {
  const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Função do frontend (suspeita)
function getWeekKeyFrontend() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Função ISO Week (padrão internacional)
function getISOWeek(date = new Date()) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `${target.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

async function debugSemana() {
  try {
    console.log('📅 DEBUG CÁLCULO DE SEMANA');
    console.log('');
    
    const agora = new Date();
    console.log('Data atual:', agora.toLocaleDateString('pt-BR'));
    console.log('');
    
    const semanaScript = getWeekKeyScript();
    const semanaFrontend = getWeekKeyFrontend();
    const semanaISO = getISOWeek();
    
    console.log('Cálculos:');
    console.log('- Script geração:', semanaScript);
    console.log('- Frontend:', semanaFrontend);
    console.log('- ISO Week:', semanaISO);
    console.log('');
    
    // Verificar que semanas existem no Firebase
    console.log('🔍 Verificando semanas disponíveis no Firebase...');
    const semanasCollection = collection(db, 'horoscopos_semanais');
    const semanasSnapshot = await getDocs(semanasCollection);
    
    console.log('Semanas encontradas:');
    semanasSnapshot.forEach(doc => {
      if (doc.id !== 'config') {
        console.log(`- ${doc.id}`);
      }
    });
    console.log('');
    
    // Testar busca de um signo específico para cada semana
    const signos = ['aries', 'taurus', 'gemini'];
    
    for (const semana of [semanaScript, semanaFrontend, semanaISO]) {
      console.log(`📋 Testando semana: ${semana}`);
      
      for (const signo of signos) {
        try {
          const horoscopoRef = doc(db, 'horoscopos_semanais', semana, 'signos', signo);
          const horoscopoSnap = await getDoc(horoscopoRef);
          
          if (horoscopoSnap.exists()) {
            console.log(`  ✅ ${signo}: encontrado`);
          } else {
            console.log(`  ❌ ${signo}: não encontrado`);
          }
        } catch (error) {
          console.log(`  ❌ ${signo}: erro - ${error.message}`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

debugSemana();