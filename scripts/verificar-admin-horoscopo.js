#!/usr/bin/env node

// Script para verificar se usuário é admin e configurar permissões para horóscopo

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Inicializar Firebase Admin
let app, db;

try {
  // Tentar múltiplos caminhos para o service account
  const possiblePaths = [
    path.join(__dirname, 'serviceAccountKey.json'),
    path.join(__dirname, '..', 'serviceAccountKey.json'),
    path.join(process.cwd(), 'serviceAccountKey.json')
  ];
  
  let serviceAccount = null;
  
  for (const filePath of possiblePaths) {
    try {
      serviceAccount = require(filePath);
      console.log(`✅ Service Account encontrado: ${filePath}`);
      break;
    } catch (error) {
      continue;
    }
  }
  
  if (!serviceAccount) {
    throw new Error('Service Account não encontrado em nenhum local');
  }

  app = initializeApp({
    credential: cert(serviceAccount)
  });
  
  db = getFirestore(app);
  console.log('✅ Firebase Admin inicializado');
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}

// Função para verificar e configurar admin
async function verificarEConfigurarAdmin() {
  try {
    // Pegar todos os usuários para encontrar você
    const usuariosSnapshot = await db.collection('usuarios').get();
    
    if (usuariosSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado na coleção usuarios');
      return;
    }
    
    console.log(`📊 Total de usuários: ${usuariosSnapshot.size}`);
    console.log('\n👥 Usuários encontrados:');
    
    let adminCount = 0;
    
    usuariosSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const isAdmin = data.isAdmin === true;
      if (isAdmin) adminCount++;
      
      console.log(`${index + 1}. ${data.nome || data.email || 'Sem nome'} (${doc.id})`);
      console.log(`   📧 Email: ${data.email || 'N/A'}`);
      console.log(`   👑 Admin: ${isAdmin ? '✅ SIM' : '❌ NÃO'}`);
      console.log('   ---');
    });
    
    console.log(`\n📊 Resumo: ${adminCount} admin(s) de ${usuariosSnapshot.size} usuários`);
    
    // Se não há admins, tornar o primeiro usuário admin
    if (adminCount === 0) {
      const primeiroUsuario = usuariosSnapshot.docs[0];
      console.log('\n⚠️ Nenhum admin encontrado! Tornando o primeiro usuário admin...');
      
      await db.collection('usuarios').doc(primeiroUsuario.id).update({
        isAdmin: true,
        adminSince: new Date(),
        adminReason: 'Auto-configurado para geração de horóscopos'
      });
      
      console.log(`✅ Usuário ${primeiroUsuario.data().nome || primeiroUsuario.id} agora é ADMIN`);
    }
    
    // Verificar regras do Firestore
    console.log('\n🔒 PRÓXIMOS PASSOS:');
    console.log('1. Copie as regras do arquivo: firestore-rules-horoscopo-diario.rules');
    console.log('2. Cole no Firebase Console > Firestore Database > Rules');
    console.log('3. Publique as regras');
    console.log('4. Execute novamente: node gerar-horoscopo-diario.js gerar --target=2025-08-10');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar
verificarEConfigurarAdmin()
  .then(() => {
    console.log('\n✅ Verificação concluída');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });