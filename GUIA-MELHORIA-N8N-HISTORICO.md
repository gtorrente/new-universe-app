# 🔧 GUIA: MELHORAR N8N PARA ARMAZENAR HISTÓRICO CORRETAMENTE

## 📋 **PROBLEMA IDENTIFICADO**

O Chat não está armazenando o histórico corretamente. O frontend está enviando os dados, mas o N8N precisa ser configurado para:

1. **Processar o histórico** recebido
2. **Usar o histórico** no prompt da IA
3. **Manter contexto** entre mensagens
4. **Salvar conversas** no Firebase

---

## 🔍 **ANÁLISE DO FRONTEND**

### **📤 Dados enviados pelo frontend:**
```javascript
{
  pergunta: "texto da pergunta",
  userId: "user123",
  historico: [
    {
      autor: "Usuário",
      texto: "Olá, como você está?",
      ordem: 1
    },
    {
      autor: "CatIA", 
      texto: "Oi! Estou muito bem, obrigada por perguntar! Como posso te ajudar hoje?",
      ordem: 2
    },
    {
      autor: "Usuário",
      texto: "Preciso de um conselho",
      ordem: 3
    }
  ],
  isNewConversation: false,
  totalMensagensNaConversa: 3,
  debug: {
    mensagensOriginais: 3,
    mensagensReais: 2,
    historicoEnviado: 3
  }
}
```

---

## 🛠️ **MELHORIAS NECESSÁRIAS NO N8N**

### **1. 📝 NÓ "CODE" PARA PROCESSAR HISTÓRICO**

**Nome do nó:** `Processar Historico`

**Código JavaScript:**
```javascript
// Recebe dados do webhook
const { pergunta, userId, historico, isNewConversation } = $input.all()[0].json;

// Processa o histórico para o formato da IA
let contextoHistorico = "";

if (historico && historico.length > 0) {
  // Limita a 10 últimas mensagens para não sobrecarregar
  const historicoLimitado = historico.slice(-10);
  
  contextoHistorico = historicoLimitado.map(msg => {
    const role = msg.autor === "Usuário" ? "user" : "assistant";
    return `${role}: ${msg.texto}`;
  }).join("\n");
}

// Cria prompt contextualizado
const promptCompleto = `Você é a CatIA, uma assistente virtual especializada em astrologia, tarot, receitas e bem-estar.

${isNewConversation ? "Esta é uma nova conversa." : "Esta é uma continuação da conversa anterior."}

${contextoHistorico ? `Histórico da conversa:\n${contextoHistorico}\n` : ""}

Pergunta atual do usuário: ${pergunta}

Responda de forma amigável, personalizada e contextualizada. Se for uma receita, use formatação com **Ingredientes:** e **Modo de Preparo:**. Se for sobre astrologia, seja específica e detalhada.`;

// Retorna dados processados
return {
  prompt: promptCompleto,
  perguntaOriginal: pergunta,
  userId: userId,
  historico: historico,
  isNewConversation: isNewConversation,
  totalMensagens: historico ? historico.length : 0
};
```

### **2. 🤖 NÓ "OPENAI" ATUALIZADO**

**Configurações:**
- **Model:** `gpt-3.5-turbo` ou `gpt-4`
- **Temperature:** `0.7`
- **Max Tokens:** `1000`
- **Messages:** Usar o prompt processado

**Estrutura de mensagens:**
```javascript
[
  {
    "role": "system",
    "content": "Você é a CatIA, uma assistente virtual especializada em astrologia, tarot, receitas e bem-estar. Seja sempre amigável, personalizada e contextualizada."
  },
  {
    "role": "user", 
    "content": "{{ $json.prompt }}"
  }
]
```

### **3. 💾 NÓ "CODE" PARA SALVAR NO FIREBASE**

**Nome do nó:** `Salvar Conversa Firebase`

**Código JavaScript:**
```javascript
const { userId, perguntaOriginal, historico, isNewConversation } = $input.all()[0].json;
const respostaIA = $input.all()[1].json.choices[0].message.content;

// Importar Firebase Admin SDK
const admin = require('firebase-admin');

// Inicializar Firebase (se não estiver inicializado)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Suas credenciais do Firebase
      projectId: "tarot-universo-catia",
      clientEmail: "firebase-adminsdk-xxxxx@tarot-universo-catia.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
    })
  });
}

const db = admin.firestore();

try {
  // Adicionar nova mensagem ao histórico
  const novoHistorico = [
    ...historico,
    {
      autor: "Usuário",
      texto: perguntaOriginal,
      ordem: historico.length + 1,
      timestamp: new Date()
    },
    {
      autor: "CatIA",
      texto: respostaIA,
      ordem: historico.length + 2,
      timestamp: new Date()
    }
  ];

  // Salvar no Firebase
  const conversaRef = db.collection('conversas_catia');
  
  await conversaRef.add({
    userId: userId,
    titulo: perguntaOriginal.length > 50 ? perguntaOriginal.substring(0, 47) + '...' : perguntaOriginal,
    mensagens: novoHistorico,
    dataInicio: new Date(Date.now() - (novoHistorico.length * 30000)),
    dataFim: admin.firestore.FieldValue.serverTimestamp(),
    totalMensagens: novoHistorico.length,
    ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✅ Conversa salva no Firebase com sucesso!');
  
  return {
    success: true,
    message: 'Conversa salva',
    totalMensagens: novoHistorico.length
  };

} catch (error) {
  console.error('❌ Erro ao salvar no Firebase:', error);
  
  return {
    success: false,
    error: error.message,
    message: 'Erro ao salvar conversa'
  };
}
```

### **4. 📤 NÓ "RESPOND TO WEBHOOK" ATUALIZADO**

**Configurações:**
- **Respond With:** `JSON`
- **Response Body:**
```json
{
  "success": true,
  "output": "{{ $json.choices[0].message.content }}",
  "historico": "{{ $('Processar Historico').json.historico }}",
  "totalMensagens": "{{ $('Salvar Conversa Firebase').json.totalMensagens }}",
  "timestamp": "{{ new Date().toISOString() }}"
}
```

---

## 🔄 **FLUXO COMPLETO DO N8N**

### **📊 Estrutura do Fluxo:**

```
Webhook → Processar Historico → OpenAI → Salvar Firebase → Respond to Webhook
```

### **📋 Passos Detalhados:**

1. **Webhook Node**
   - Recebe dados do frontend
   - Valida estrutura dos dados

2. **Processar Historico (Code Node)**
   - Processa o histórico recebido
   - Cria prompt contextualizado
   - Prepara dados para IA

3. **OpenAI Node**
   - Usa prompt processado
   - Gera resposta contextualizada
   - Mantém personalidade da CatIA

4. **Salvar Firebase (Code Node)**
   - Salva conversa completa
   - Atualiza histórico
   - Registra timestamps

5. **Respond to Webhook**
   - Retorna resposta formatada
   - Inclui dados de debug
   - Confirma salvamento

---

## 🎯 **MELHORIAS ESPECÍFICAS**

### **1. 📚 Gerenciamento de Contexto**
```javascript
// No nó "Processar Historico"
const MAX_HISTORICO = 10; // Limita a 10 mensagens
const historicoLimitado = historico.slice(-MAX_HISTORICO);

// Adiciona contexto de personalidade
const contextoPersonalidade = `
Você é a CatIA, uma assistente virtual especializada em:
- Astrologia e horóscopos
- Tarot e cartomancia  
- Receitas culinárias
- Bem-estar e autoajuda

Sempre seja:
- Amigável e acolhedora
- Personalizada nas respostas
- Contextualizada com o histórico
- Específica em suas recomendações
`;
```

### **2. 🔄 Persistência de Conversas**
```javascript
// No nó "Salvar Firebase"
// Buscar conversa existente ou criar nova
const conversaExistente = await conversaRef
  .where('userId', '==', userId)
  .where('ativa', '==', true)
  .orderBy('dataFim', 'desc')
  .limit(1)
  .get();

if (!conversaExistente.empty) {
  // Atualizar conversa existente
  const docRef = conversaExistente.docs[0].ref;
  await docRef.update({
    mensagens: novoHistorico,
    dataFim: admin.firestore.FieldValue.serverTimestamp(),
    totalMensagens: novoHistorico.length
  });
} else {
  // Criar nova conversa
  await conversaRef.add({
    userId: userId,
    ativa: true,
    titulo: perguntaOriginal,
    mensagens: novoHistorico,
    dataInicio: admin.firestore.FieldValue.serverTimestamp(),
    dataFim: admin.firestore.FieldValue.serverTimestamp(),
    totalMensagens: novoHistorico.length
  });
}
```

### **3. 🎨 Formatação de Respostas**
```javascript
// No nó "OpenAI" - System Prompt
const systemPrompt = `Você é a CatIA, uma assistente virtual especializada em astrologia, tarot, receitas e bem-estar.

FORMATAÇÃO ESPECÍFICA:
- Para receitas: Use **Ingredientes:** e **Modo de Preparo:**
- Para horóscopos: Seja específica e detalhada
- Para tarot: Use linguagem mística e intuitiva
- Para conselhos: Seja empática e prática

SEMPRE mantenha o contexto da conversa anterior e seja personalizada.`;
```

---

## 🧪 **TESTES RECOMENDADOS**

### **1. 📝 Teste de Histórico**
```javascript
// Enviar via Postman ou curl
{
  "pergunta": "Qual meu nome?",
  "userId": "test123",
  "historico": [
    {
      "autor": "Usuário",
      "texto": "Meu nome é Gustavo",
      "ordem": 1
    },
    {
      "autor": "CatIA", 
      "texto": "Prazer em conhecer você, Gustavo! Como posso te ajudar?",
      "ordem": 2
    }
  ],
  "isNewConversation": false
}
```

### **2. 🔍 Verificar Firebase**
```javascript
// Consultar no Firebase Console
db.collection('conversas_catia')
  .where('userId', '==', 'test123')
  .orderBy('dataFim', 'desc')
  .limit(5)
```

### **3. 📊 Logs de Debug**
```javascript
// Adicionar logs em cada nó
console.log('📥 Dados recebidos:', $input.all()[0].json);
console.log('📚 Histórico processado:', contextoHistorico);
console.log('🤖 Resposta da IA:', respostaIA);
console.log('💾 Salvamento:', resultadoSalvamento);
```

---

## 🚀 **IMPLEMENTAÇÃO PASSO A PASSO**

### **Passo 1: Atualizar N8N**
1. Acesse seu N8N
2. Edite o fluxo existente
3. Adicione os novos nós conforme guia

### **Passo 2: Configurar Firebase**
1. Obter credenciais do Firebase Admin SDK
2. Configurar no nó "Salvar Firebase"
3. Testar conexão

### **Passo 3: Testar Fluxo**
1. Enviar mensagem de teste
2. Verificar logs do N8N
3. Confirmar salvamento no Firebase

### **Passo 4: Monitorar**
1. Verificar conversas salvas
2. Monitorar performance
3. Ajustar conforme necessário

---

## ✅ **RESULTADO ESPERADO**

Após implementar essas melhorias:

- **✅ Histórico mantido** entre mensagens
- **✅ Conversas salvas** no Firebase
- **✅ Contexto preservado** pela IA
- **✅ Respostas personalizadas** e contextualizadas
- **✅ Sistema robusto** com fallbacks

**🎯 O Chat funcionará perfeitamente com histórico completo!** 