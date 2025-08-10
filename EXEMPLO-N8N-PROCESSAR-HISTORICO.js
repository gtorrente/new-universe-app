// 🔧 EXEMPLO PRÁTICO: NÓ N8N PARA PROCESSAR HISTÓRICO
// Nome do nó: "Processar Historico"
// Tipo: Code Node

// ========================================
// 📥 DADOS DE ENTRADA DO WEBHOOK
// ========================================
const dadosRecebidos = $input.all()[0].json;

console.log('📥 Dados recebidos:', dadosRecebidos);

// Extrair dados principais
const { 
  pergunta, 
  userId, 
  historico, 
  isNewConversation,
  totalMensagensNaConversa 
} = dadosRecebidos;

// ========================================
// 🔄 PROCESSAMENTO DO HISTÓRICO
// ========================================
let contextoHistorico = "";
let historicoProcessado = [];

if (historico && historico.length > 0) {
  console.log('📚 Histórico recebido:', historico.length, 'mensagens');
  
  // Limitar a 10 últimas mensagens para não sobrecarregar
  const MAX_HISTORICO = 10;
  const historicoLimitado = historico.slice(-MAX_HISTORICO);
  
  console.log('📊 Histórico limitado a:', historicoLimitado.length, 'mensagens');
  
  // Processar cada mensagem do histórico
  historicoProcessado = historicoLimitado.map((msg, index) => {
    const role = msg.autor === "Usuário" ? "user" : "assistant";
    return `${role}: ${msg.texto}`;
  });
  
  // Juntar em uma string para o contexto
  contextoHistorico = historicoProcessado.join("\n");
  
  console.log('📝 Contexto histórico criado:', contextoHistorico.length, 'caracteres');
}

// ========================================
// 🎯 CRIAÇÃO DO PROMPT CONTEXTUALIZADO
// ========================================
const contextoPersonalidade = `Você é a CatIA, uma assistente virtual especializada em astrologia, tarot, receitas e bem-estar.

PERSONALIDADE:
- Amigável e acolhedora
- Personalizada nas respostas
- Contextualizada com o histórico
- Específica em suas recomendações

ESPECIALIDADES:
- Astrologia e horóscopos
- Tarot e cartomancia
- Receitas culinárias
- Bem-estar e autoajuda

FORMATAÇÃO ESPECÍFICA:
- Para receitas: Use **Ingredientes:** e **Modo de Preparo:**
- Para horóscopos: Seja específica e detalhada
- Para tarot: Use linguagem mística e intuitiva
- Para conselhos: Seja empática e prática`;

const contextoConversa = isNewConversation 
  ? "Esta é uma nova conversa. Seja bem-vindo e apresente-se de forma acolhedora."
  : "Esta é uma continuação da conversa anterior. Mantenha o contexto e seja personalizada.";

const promptCompleto = `${contextoPersonalidade}

${contextoConversa}

${contextoHistorico ? `HISTÓRICO DA CONVERSA:\n${contextoHistorico}\n` : ""}

PERGUNTA ATUAL DO USUÁRIO: ${pergunta}

Responda de forma amigável, personalizada e contextualizada, mantendo a personalidade da CatIA.`;

console.log('🤖 Prompt completo criado:', promptCompleto.length, 'caracteres');

// ========================================
// 📊 DADOS DE DEBUG E MONITORAMENTO
// ========================================
const dadosDebug = {
  perguntaOriginal: pergunta,
  userId: userId,
  historicoRecebido: historico ? historico.length : 0,
  historicoProcessado: historicoProcessado.length,
  isNewConversation: isNewConversation,
  totalMensagensNaConversa: totalMensagensNaConversa,
  tamanhoPrompt: promptCompleto.length,
  timestamp: new Date().toISOString()
};

console.log('📊 Dados de debug:', dadosDebug);

// ========================================
// 📤 DADOS DE SAÍDA
// ========================================
return {
  // Dados principais para OpenAI
  prompt: promptCompleto,
  perguntaOriginal: pergunta,
  userId: userId,
  
  // Histórico processado
  historico: historico,
  historicoProcessado: historicoProcessado,
  contextoHistorico: contextoHistorico,
  
  // Metadados
  isNewConversation: isNewConversation,
  totalMensagens: historico ? historico.length : 0,
  
  // Debug
  debug: dadosDebug
}; 