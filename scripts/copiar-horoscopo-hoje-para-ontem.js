// Script para copiar horóscopos de hoje (29/07) para ontem (28/07)
// Solução rápida para resolver problema da madrugada

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

async function copiarHoroscopos() {
  console.log('📋 Copiando horóscopos de HOJE para ONTEM...');
  console.log('📅 Origem: 2025-07-29 (hoje)');
  console.log('📅 Destino: 2025-07-28 (ontem)');
  
  const sucessos = [];
  const falhas = [];

  for (const signo of signos) {
    try {
      console.log(`📋 Copiando ${signo}...`);
      
      // Ler horóscopo de hoje
      const origemRef = db.doc(`horoscopos_diarios/2025-07-29/signos/${signo}`);
      const origemDoc = await origemRef.get();
      
      if (!origemDoc.exists) {
        throw new Error('Horóscopo de hoje não encontrado');
      }
      
      const dados = origemDoc.data();
      
      // Salvar como horóscopo de ontem
      const destinoRef = db.doc(`horoscopos_diarios/2025-07-28/signos/${signo}`);
      await destinoRef.set({
        horoscopo: {
          mensagem: dados.horoscopo.mensagem,
          gerado_em: new Date().toISOString(),
          tipo: 'diario',
          copiado_de: '2025-07-29',
          nota: 'Copiado para resolver gap da madrugada'
        }
      });
      
      console.log(`✅ ${signo} copiado com sucesso`);
      sucessos.push(signo);
      
    } catch (error) {
      console.error(`❌ Erro ao copiar ${signo}:`, error.message);
      falhas.push({ signo, erro: error.message });
    }
  }

  console.log('\n📊 RELATÓRIO:');
  console.log(`✅ Sucessos: ${sucessos.length}`);
  console.log(`❌ Falhas: ${falhas.length}`);
  
  if (falhas.length > 0) {
    console.log('\n❌ Falhas detalhadas:');
    falhas.forEach(f => console.log(`  - ${f.signo}: ${f.erro}`));
  }

  console.log('\n🎉 Cópia concluída!');
  console.log('💡 Agora o Node-RED pode buscar horóscopos de ontem na madrugada');
}

// Executar script
copiarHoroscopos().catch(console.error); 