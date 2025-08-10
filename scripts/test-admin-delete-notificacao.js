const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, deleteDoc, getDoc, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBhuWwh_riGIGD-QL_h-Z3-q7kY7Yj4ZrE',
  authDomain: 'tarot-universo-catia.firebaseapp.com',
  projectId: 'tarot-universo-catia',
  storageBucket: 'tarot-universo-catia.appspot.com',
  messagingSenderId: '248009503977',
  appId: '1:248009503977:web:a85f8b9b0f4b5c7d8e9a2c'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testAdminDelete() {
  try {
    console.log('🔐 Fazendo login como admin...');
    
    // Login como admin
    const userCredential = await signInWithEmailAndPassword(auth, 'gustavo.pinhati@gmail.com', 'admin123');
    console.log('✅ Login realizado:', userCredential.user.email);
    
    // Verificar status de admin
    const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
    console.log('👑 Status admin:', userDoc.data()?.isAdmin);
    
    // Listar notificações
    console.log('\n📋 Listando notificações...');
    const notificacoesSnap = await getDocs(collection(db, 'notificacoes'));
    notificacoesSnap.forEach(doc => {
      console.log(`📄 ID: ${doc.id} | Título: ${doc.data().titulo}`);
    });
    
    if (notificacoesSnap.empty) {
      console.log('❌ Nenhuma notificação encontrada');
      return;
    }
    
    // Pegar primeira notificação para teste
    const firstDoc = notificacoesSnap.docs[0];
    const notifId = firstDoc.id;
    
    console.log(`\n🗑️ Tentando deletar: ${notifId}`);
    
    // Tentar deletar
    await deleteDoc(doc(db, 'notificacoes', notifId));
    console.log('✅ DeleteDoc executado com sucesso');
    
    // Verificar se foi deletado
    const docCheck = await getDoc(doc(db, 'notificacoes', notifId));
    if (docCheck.exists()) {
      console.log('❌ ERRO: Documento ainda existe!');
      console.log('📄 Dados:', docCheck.data());
    } else {
      console.log('✅ SUCESSO: Documento foi deletado completamente');
    }
    
    // Listar novamente
    console.log('\n📋 Listando notificações após deleção...');
    const notificacoesSnapAfter = await getDocs(collection(db, 'notificacoes'));
    notificacoesSnapAfter.forEach(doc => {
      console.log(`📄 ID: ${doc.id} | Título: ${doc.data().titulo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.code, error.message);
    if (error.code === 'permission-denied') {
      console.error('🚫 PROBLEMA DE PERMISSÃO: As regras Firestore não estão aplicadas corretamente!');
    }
  }
}

testAdminDelete();