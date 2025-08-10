// Cole este código no CONSOLE DO BROWSER (F12) quando estiver logado no app
// Teste de permissões de admin no browser

async function testarPermissoesAdmin() {
  try {
    console.log('🧪 TESTE: Permissões de Admin no Browser');
    console.log('');
    
    // 1. Verificar usuário autenticado
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Usuário não está logado');
      return;
    }
    
    console.log('👤 Usuário logado:', user.displayName, user.email);
    console.log('🆔 UID:', user.uid);
    console.log('');
    
    // 2. Verificar se é admin
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (!userDoc.exists()) {
      console.error('❌ Documento do usuário não encontrado');
      return;
    }
    
    const userData = userDoc.data();
    const isAdmin = userData.isAdmin === true;
    
    console.log('📋 Dados do usuário:');
    console.log('  Nome:', userData.displayName || userData.name);
    console.log('  Admin:', isAdmin ? '✅ SIM' : '❌ NÃO');
    console.log('  Créditos:', userData.creditos || 0);
    console.log('');
    
    if (!isAdmin) {
      console.error('❌ PROBLEMA: Usuário não é admin');
      console.log('💡 SOLUÇÃO: Adicione isAdmin: true no Firestore');
      return;
    }
    
    // 3. Testar leitura de notificações
    console.log('📖 3. Testando leitura de notificações...');
    const notificacoesSnapshot = await getDocs(collection(db, 'notificacoes'));
    console.log(`✅ Leitura OK: ${notificacoesSnapshot.docs.length} notificações`);
    
    if (notificacoesSnapshot.docs.length === 0) {
      console.log('⚠️ Nenhuma notificação encontrada');
      return;
    }
    
    // 4. Testar criação
    console.log('➕ 4. Testando criação de notificação...');
    const novaNotificacao = {
      titulo: 'Teste Admin',
      mensagem: 'Notificação de teste criada pelo console',
      tipo: 'teste',
      publico: 'todos',
      ativa: false,
      icone: '🧪',
      prioridade: 'baixa',
      createdAt: serverTimestamp(),
      visualizacoes: 0,
      cliques: 0
    };
    
    const docRef = await addDoc(collection(db, 'notificacoes'), novaNotificacao);
    console.log(`✅ Criação OK: ID ${docRef.id}`);
    
    // 5. Testar edição
    console.log('✏️ 5. Testando edição...');
    await updateDoc(doc(db, 'notificacoes', docRef.id), {
      titulo: 'Teste Admin (Editado)',
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Edição OK: ${docRef.id}`);
    
    // 6. Testar deleção
    console.log('🗑️ 6. Testando deleção...');
    await deleteDoc(doc(db, 'notificacoes', docRef.id));
    console.log(`✅ Deleção OK: ${docRef.id}`);
    
    console.log('');
    console.log('🎉 SUCESSO: Todas as operações funcionaram!');
    console.log('📝 O problema pode estar na interface do admin, não nas permissões');
    
  } catch (error) {
    console.error('❌ ERRO:', error.code, error.message);
    if (error.code === 'permission-denied') {
      console.log('💡 Verifique se você tem isAdmin: true no Firestore');
    }
  }
}

// Para executar, digite no console:
// testarPermissoesAdmin()

console.log('📋 INSTRUÇÕES:');
console.log('1. Certifique-se de estar logado no app');
console.log('2. Abra o console do browser (F12)');
console.log('3. Cole este código');
console.log('4. Digite: testarPermissoesAdmin()');
console.log('5. Pressione Enter');