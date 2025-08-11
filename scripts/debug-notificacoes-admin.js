#!/usr/bin/env node

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, setDoc, serverTimestamp } = require('firebase/firestore');

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

console.log('🔥 Firebase conectado:', firebaseConfig.projectId);

async function debugNotificacoes() {
  try {
    console.log('🔍 Analisando notificações...\n');
    
    // Buscar todas as notificações
    const notificacoesSnapshot = await getDocs(collection(db, 'notificacoes'));
    
    console.log(`📊 Total de documentos encontrados: ${notificacoesSnapshot.size}\n`);
    
    const problematicas = [];
    const normais = [];
    
    for (const docSnap of notificacoesSnapshot.docs) {
      const id = docSnap.id;
      const data = docSnap.data();
      
      console.log(`📄 ID: ${id}`);
      console.log(`   📝 Título: ${data.titulo || 'N/A'}`);
      console.log(`   🔄 Status: ${data.status || 'N/A'}`);
      console.log(`   ✅ Ativa: ${data.ativa}`);
      console.log(`   📅 Criado: ${data.createdAt ? 'Sim' : 'Não'}`);
      
      // Verificar se é problemática (aparece na lista mas não pode ser deletada)
      if (data.ativa !== false && data.status !== 'deletada') {
        // Tentar ler novamente para confirmar existência
        try {
          const verificacao = await getDoc(doc(db, 'notificacoes', id));
          if (!verificacao.exists()) {
            problematicas.push({ id, data, motivo: 'Documento não existe na verificação' });
          } else {
            normais.push({ id, data });
          }
        } catch (error) {
          problematicas.push({ id, data, motivo: `Erro ao verificar: ${error.message}` });
        }
      } else {
        console.log(`   🗑️ Esta notificação já está marcada como deletada/inativa`);
      }
      
      console.log('   ---\n');
    }
    
    console.log(`\n📊 RESUMO:`);
    console.log(`✅ Notificações normais: ${normais.length}`);
    console.log(`❌ Notificações problemáticas: ${problematicas.length}`);
    
    if (problematicas.length > 0) {
      console.log(`\n🔧 NOTIFICAÇÕES PROBLEMÁTICAS:`);
      problematicas.forEach(p => {
        console.log(`   • ${p.id}: ${p.motivo}`);
      });
      
      console.log(`\n🛠️ CORREÇÕES SUGERIDAS:`);
      console.log(`1. Marcar como deletadas (soft delete):`);
      
      for (const p of problematicas) {
        try {
          console.log(`   Corrigindo ${p.id}...`);
          await setDoc(doc(db, 'notificacoes', p.id), {
            ativa: false,
            status: 'deletada',
            deletedAt: serverTimestamp(),
            corrigidoPor: 'script-debug',
            corrigidoEm: new Date()
          }, { merge: true });
          console.log(`   ✅ ${p.id} marcada como deletada`);
        } catch (error) {
          console.log(`   ❌ Erro ao corrigir ${p.id}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Análise concluída!`);
    
  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }
}

// Executar
debugNotificacoes()
  .then(() => {
    console.log('\n🎉 Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });