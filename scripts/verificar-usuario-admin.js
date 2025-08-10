// Script para verificar se usuário tem permissões de admin
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function verificarUsuariosAdmin() {
  try {
    console.log('👤 VERIFICAÇÃO: Usuários com permissão de Admin');
    console.log('');
    
    // 1. Listar todos os usuários
    console.log('📋 1. Listando usuários no Firebase...');
    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
    
    console.log(`✅ Encontrados ${usuariosSnapshot.docs.length} usuários`);
    console.log('');
    
    if (usuariosSnapshot.docs.length === 0) {
      console.log('❌ Nenhum usuário encontrado na coleção usuarios');
      return;
    }
    
    // 2. Verificar quais são admins
    console.log('🔍 2. Verificando permissões de admin:');
    console.log('');
    
    let adminsEncontrados = 0;
    
    usuariosSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const isAdmin = data.isAdmin === true;
      
      console.log(`  ${index + 1}. ID: ${doc.id}`);
      console.log(`     Nome: ${data.displayName || data.name || 'N/A'}`);
      console.log(`     Email: ${data.email || 'N/A'}`);
      console.log(`     Admin: ${isAdmin ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`     Créditos: ${data.creditos || 0}`);
      console.log('');
      
      if (isAdmin) {
        adminsEncontrados++;
      }
    });
    
    console.log('📊 RESUMO:');
    console.log(`  Total de usuários: ${usuariosSnapshot.docs.length}`);
    console.log(`  Usuários admin: ${adminsEncontrados}`);
    console.log('');
    
    if (adminsEncontrados === 0) {
      console.log('⚠️ PROBLEMA: Nenhum usuário tem isAdmin: true');
      console.log('💡 SOLUÇÃO: ');
      console.log('   1. Vá no Firebase Console → Firestore → usuarios');
      console.log('   2. Abra seu documento de usuário');
      console.log('   3. Adicione o campo: isAdmin (boolean) = true');
      console.log('');
    }
    
    // 3. Testar regras básicas de permissão
    console.log('🧪 3. Testando acesso à coleção notificacoes...');
    try {
      const notificacoesSnapshot = await getDocs(collection(db, 'notificacoes'));
      console.log(`✅ Sucesso: Encontradas ${notificacoesSnapshot.docs.length} notificações`);
      
      if (notificacoesSnapshot.docs.length > 0) {
        console.log('📋 Primeiras notificações:');
        notificacoesSnapshot.docs.slice(0, 3).forEach((doc, idx) => {
          const data = doc.data();
          console.log(`   ${idx + 1}. ${data.titulo} (${data.ativa ? 'Ativa' : 'Inativa'})`);
        });
      }
    } catch (permissionError) {
      console.error('❌ Erro de permissão:', permissionError.code);
      console.log('💡 Isso confirma que as regras estão ativas, mas você precisa ser admin');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Código:', error.code);
  }
}

verificarUsuariosAdmin();