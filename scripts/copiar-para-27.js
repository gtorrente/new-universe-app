// Script para copiar horóscopos para 27/07 (solução temporária)

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { credential } = require('firebase-admin');

// Inicializar Firebase Admin
const app = initializeApp({
  credential: credential.applicationDefault(),
  projectId: 'tarot-universo-catia'
});

const db = getFirestore(app);

// Lista de signos
const signos = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

async function copiarPara27() {
  console.log('📋 Copiando horóscopos para 27/07 (temporário)...');
  console.log('📅 Origem: 2025-07-28');
  console.log('📅 Destino: 2025-07-27');
  
  const sucessos = [];
  const falhas = [];

  for (const signo of signos) {
    try {
      console.log(`📋 Copiando ${signo}...`);
      
      // Ler horóscopo de 28/07
      const origemRef = db.doc(`horoscopos_diarios/2025-07-28/signos/${signo}`);
      const origemDoc = await origemRef.get();
      
      if (!origemDoc.exists) {
        throw new Error('Horóscopo do dia 28 não encontrado');
      }
      
      const dados = origemDoc.data();
      
      // Salvar como horóscopo de 27/07
      const destinoRef = db.doc(`horoscopos_diarios/2025-07-27/signos/${signo}`);
      await destinoRef.set({
        horoscopo: {
          mensagem: dados.horoscopo.mensagem,
          gerado_em: new Date().toISOString(),
          tipo: 'diario',
          copiado_de: '2025-07-28',
          nota: 'Copiado temporariamente para Node-RED antigo'
        }
      });
      
      console.log(`✅ ${signo} copiado`);
      sucessos.push(signo);
      
    } catch (error) {
      console.error(`❌ Erro ao copiar ${signo}:`, error.message);
      falhas.push({ signo, erro: error.message });
    }
  }

  console.log('\n📊 RELATÓRIO:');
  console.log(`✅ Sucessos: ${sucessos.length}`);
  console.log(`❌ Falhas: ${falhas.length}`);
  
  console.log('\n⚠️ IMPORTANTE:');
  console.log('Isso é uma solução TEMPORÁRIA!');
  console.log('Você PRECISA aplicar a versão V2 no Node-RED!');
}

copiarPara27().catch(console.error); 