// 🔧 EXEMPLO PRÁTICO: NÓ N8N PARA SALVAR NO FIREBASE
// Nome do nó: "Salvar Conversa Firebase"
// Tipo: Code Node

// ========================================
// 📥 DADOS DE ENTRADA
// ========================================
// Dados do nó "Processar Historico"
const dadosProcessados = $input.all()[0].json;
// Resposta da OpenAI
const respostaOpenAI = $input.all()[1].json;

console.log('📥 Dados processados:', dadosProcessados);
console.log('🤖 Resposta OpenAI:', respostaOpenAI);

// Extrair dados necessários
const { 
  userId, 
  perguntaOriginal, 
  historico, 
  isNewConversation 
} = dadosProcessados;

const respostaIA = respostaOpenAI.choices[0].message.content;

console.log('💬 Resposta da IA:', respostaIA);

// ========================================
// 🔥 CONFIGURAÇÃO DO FIREBASE
// ========================================
// NOTA: Você precisa configurar as credenciais do Firebase Admin SDK
// no seu N8N ou usar uma API REST do Firebase

// Opção 1: Usando Firebase Admin SDK (se configurado no N8N)
// const admin = require('firebase-admin');
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: "tarot-universo-catia",
//       clientEmail: "firebase-adminsdk-xxxxx@tarot-universo-catia.iam.gserviceaccount.com",
//       privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//     })
//   });
// }
// const db = admin.firestore();

// Opção 2: Usando API REST do Firebase (mais simples)
const FIREBASE_PROJECT_ID = "tarot-universo-catia";
const FIREBASE_API_KEY = "sua-api-key-aqui"; // Obter no console do Firebase

// ========================================
// 📝 PREPARAÇÃO DOS DADOS
// ========================================
// Adicionar nova mensagem ao histórico
const novoHistorico = [
  ...historico,
  {
    autor: "Usuário",
    texto: perguntaOriginal,
    ordem: historico.length + 1,
    timestamp: new Date().toISOString()
  },
  {
    autor: "CatIA",
    texto: respostaIA,
    ordem: historico.length + 2,
    timestamp: new Date().toISOString()
  }
];

// Criar título para a conversa
const titulo = perguntaOriginal.length > 50 
  ? perguntaOriginal.substring(0, 47) + '...' 
  : perguntaOriginal;

// Dados da conversa
const dadosConversa = {
  userId: userId,
  titulo: titulo,
  mensagens: novoHistorico,
  dataInicio: new Date(Date.now() - (novoHistorico.length * 30000)).toISOString(),
  dataFim: new Date().toISOString(),
  totalMensagens: novoHistorico.length,
  ultimaAtualizacao: new Date().toISOString(),
  ativa: true
};

console.log('💾 Dados da conversa preparados:', dadosConversa);

// ========================================
// 🔄 SALVAMENTO NO FIREBASE
// ========================================
try {
  // Opção 1: Usando Firebase Admin SDK
  // const conversaRef = db.collection('conversas_catia');
  // const docRef = await conversaRef.add(dadosConversa);
  // console.log('✅ Conversa salva com ID:', docRef.id);

  // Opção 2: Usando API REST do Firebase
  const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/conversas_catia`;
  
  const response = await fetch(firebaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREBASE_API_KEY}`
    },
    body: JSON.stringify({
      fields: {
        userId: { stringValue: dadosConversa.userId },
        titulo: { stringValue: dadosConversa.titulo },
        totalMensagens: { integerValue: dadosConversa.totalMensagens },
        dataInicio: { timestampValue: dadosConversa.dataInicio },
        dataFim: { timestampValue: dadosConversa.dataFim },
        ultimaAtualizacao: { timestampValue: dadosConversa.ultimaAtualizacao },
        ativa: { booleanValue: dadosConversa.ativa },
        mensagens: { 
          arrayValue: { 
            values: dadosConversa.mensagens.map(msg => ({
              mapValue: {
                fields: {
                  autor: { stringValue: msg.autor },
                  texto: { stringValue: msg.texto },
                  ordem: { integerValue: msg.ordem },
                  timestamp: { timestampValue: msg.timestamp }
                }
              }
            }))
          }
        }
      }
    })
  });

  if (response.ok) {
    const resultado = await response.json();
    console.log('✅ Conversa salva no Firebase com sucesso!');
    console.log('📄 Documento criado:', resultado.name);
    
    return {
      success: true,
      message: 'Conversa salva com sucesso',
      documentId: resultado.name,
      totalMensagens: novoHistorico.length,
      timestamp: new Date().toISOString()
    };
  } else {
    throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
  }

} catch (error) {
  console.error('❌ Erro ao salvar no Firebase:', error);
  
  // Retornar erro mas não falhar o fluxo
  return {
    success: false,
    error: error.message,
    message: 'Erro ao salvar conversa, mas resposta da IA foi enviada',
    totalMensagens: novoHistorico.length,
    timestamp: new Date().toISOString()
  };
}

// ========================================
// 📊 DADOS DE DEBUG
// ========================================
const dadosDebug = {
  userId: userId,
  perguntaOriginal: perguntaOriginal,
  respostaIA: respostaIA.substring(0, 100) + '...',
  historicoAnterior: historico.length,
  historicoNovo: novoHistorico.length,
  isNewConversation: isNewConversation,
  timestamp: new Date().toISOString()
};

console.log('📊 Dados de debug salvamento:', dadosDebug); 