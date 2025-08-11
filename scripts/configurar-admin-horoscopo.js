#!/usr/bin/env node

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, getDoc } = require('firebase/firestore');

// Configuração do Firebase (mesma dos outros scripts)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Verificar configuração
if (!firebaseConfig.projectId) {
  console.error('❌ FIREBASE_PROJECT_ID não configurado no .env');
  console.log('💡 Configure as variáveis de ambiente no arquivo .env');
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase conectado:', firebaseConfig.projectId);

// Função para verificar e configurar admin
async function configurarAdmin() {
  try {
    console.log('🔍 Buscando usuários...');
    
    // Buscar todos os usuários
    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
    
    if (usuariosSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    console.log(`📊 ${usuariosSnapshot.size} usuário(s) encontrado(s)\n`);
    
    let adminCount = 0;
    const usuarios = [];
    
    usuariosSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isAdmin = data.isAdmin === true;
      if (isAdmin) adminCount++;
      
      usuarios.push({
        id: docSnap.id,
        nome: data.nome || data.email || 'Sem nome',
        email: data.email || 'N/A',
        isAdmin: isAdmin
      });
    });
    
    // Listar usuários
    usuarios.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome} (${user.email})`);
      console.log(`   👑 Admin: ${user.isAdmin ? '✅ SIM' : '❌ NÃO'}`);
      console.log('   ---');
    });
    
    console.log(`\n📊 Total: ${adminCount} admin(s) de ${usuarios.length} usuário(s)`);
    
    // Se não há admins, tornar o primeiro usuário admin
    if (adminCount === 0) {
      const primeiroUsuario = usuarios[0];
      console.log(`\n⚡ Configurando ${primeiroUsuario.nome} como ADMIN...`);
      
      await updateDoc(doc(db, 'usuarios', primeiroUsuario.id), {
        isAdmin: true,
        adminSince: new Date(),
        adminReason: 'Auto-configurado para geração de horóscopos'
      });
      
      console.log(`✅ ${primeiroUsuario.nome} agora é ADMIN!`);
    }
    
    // Tentar uma operação de escrita de teste
    console.log('\n🧪 Testando permissões de escrita...');
    
    try {
      const testDoc = doc(db, 'horoscopo_diario', '2025-08-10', 'test', 'permission_test');
      await updateDoc(testDoc, {
        test: true,
        timestamp: new Date()
      });
      console.log('✅ Escrita funcionando!');
    } catch (writeError) {
      console.log('❌ Escrita falhou:', writeError.code);
      if (writeError.code === 'permission-denied') {
        console.log('\n🔒 PROBLEMA: Regras do Firestore estão bloqueando a escrita');
        console.log('\n📋 SOLUÇÃO:');
        console.log('1. Abra o Firebase Console: https://console.firebase.google.com');
        console.log(`2. Vá para o projeto: ${firebaseConfig.projectId}`);
        console.log('3. Firestore Database > Rules');
        console.log('4. Copie as regras do arquivo: firestore-rules-horoscopo-diario.rules');
        console.log('5. Cole e publique as regras');
        console.log('6. Tente gerar o horóscopo novamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar
configurarAdmin()
  .then(() => {
    console.log('\n✅ Configuração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });