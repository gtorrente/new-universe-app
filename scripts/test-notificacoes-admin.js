// Script para testar permissões de notificações para admin
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp } = require('firebase/firestore');

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

async function testarNotificacoesAdmin() {
  try {
    console.log('🔔 TESTE: Permissões de Notificações para Admin');
    console.log('');
    
    // 1. Listar notificações existentes
    console.log('📋 1. Listando notificações existentes...');
    const notificacoesSnapshot = await getDocs(collection(db, 'notificacoes'));
    
    console.log(`✅ Encontradas ${notificacoesSnapshot.docs.length} notificações`);
    
    if (notificacoesSnapshot.docs.length === 0) {
      console.log('⚠️ Nenhuma notificação encontrada. Criando uma para teste...');
      
      // Criar notificação de teste
      const notificacaoTeste = {
        titulo: 'Teste Admin',
        mensagem: 'Notificação criada automaticamente para teste de deletar',
        tipo: 'teste',
        publico: 'todos',
        ativa: true,
        icone: '🧪',
        prioridade: 'normal',
        createdAt: serverTimestamp(),
        visualizacoes: 0,
        cliques: 0
      };
      
      const docRef = await addDoc(collection(db, 'notificacoes'), notificacaoTeste);
      console.log(`✅ Notificação de teste criada com ID: ${docRef.id}`);
      return;
    }
    
    // 2. Listar detalhes das notificações
    console.log('');
    console.log('📝 2. Detalhes das notificações:');
    notificacoesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ID: ${doc.id}`);
      console.log(`     Título: ${data.titulo}`);
      console.log(`     Ativa: ${data.ativa}`);
      console.log(`     Tipo: ${data.tipo}`);
      console.log('');
    });
    
    // 3. Tentar deletar a primeira notificação (se existir)
    if (notificacoesSnapshot.docs.length > 0) {
      const primeiraNotificacao = notificacoesSnapshot.docs[0];
      const id = primeiraNotificacao.id;
      const titulo = primeiraNotificacao.data().titulo;
      
      console.log(`🗑️ 3. Tentando deletar notificação: "${titulo}" (ID: ${id})`);
      
      try {
        await deleteDoc(doc(db, 'notificacoes', id));
        console.log('✅ Notificação deletada com sucesso!');
        
        // Verificar se foi realmente deletada
        const verificacao = await getDocs(collection(db, 'notificacoes'));
        console.log(`📊 Verificação: Restam ${verificacao.docs.length} notificações`);
        
      } catch (deleteError) {
        console.error('❌ Erro ao deletar:', deleteError.message);
        console.error('Código do erro:', deleteError.code);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Código do erro:', error.code);
  }
}

testarNotificacoesAdmin();