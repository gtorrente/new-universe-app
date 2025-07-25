# 🤖 Exemplo de Implementação - AI Tracking

## 📊 Como Usar o Sistema de Tracking

### 1. **Import do Utilitário**
```javascript
import { logAIRequest, AI_REQUEST_TYPES } from '../utils/aiTracking';
```

### 2. **Exemplo na Página de Tarot**
```javascript
// src/pages/Tarot.jsx
import { logAIRequest, AI_REQUEST_TYPES } from '../utils/aiTracking';

// Dentro da função de leitura de tarot
const handleTarotReading = async () => {
  try {
    setLoading(true);
    
    // Registrar o request de IA ANTES de fazer a chamada
    await logAIRequest(user.uid, AI_REQUEST_TYPES.TAROT, {
      pergunta: pergunta,
      cartas: cartasSelecionadas.length,
      timestamp: new Date().toISOString()
    });
    
    // Fazer a leitura do tarot
    const resultado = await realizarLeituraDoTarot();
    
    setResultado(resultado);
    
  } catch (error) {
    console.error('Erro na leitura:', error);
  } finally {
    setLoading(false);
  }
};
```

### 3. **Exemplo na Página CatiaChat**
```javascript
// src/pages/CatiaChat.jsx
import { logAIRequest, AI_REQUEST_TYPES } from '../utils/aiTracking';

// Dentro da função de envio de mensagem
const handleSendMessage = async (message) => {
  try {
    // Registrar o request de IA
    await logAIRequest(user.uid, AI_REQUEST_TYPES.CHAT, {
      messageLength: message.length,
      sessionId: chatSessionId,
      timestamp: new Date().toISOString()
    });
    
    // Enviar mensagem para a IA
    const response = await sendMessageToAI(message);
    
    setChatHistory([...chatHistory, response]);
    
  } catch (error) {
    console.error('Erro no chat:', error);
  }
};
```

### 4. **Exemplo na Previsão Semanal**
```javascript
// src/pages/PrevisaoSemanal.jsx
import { logAIRequest, AI_REQUEST_TYPES } from '../utils/aiTracking';

// Dentro da função de geração de previsão
const gerarPrevisaoSemanal = async () => {
  try {
    setLoading(true);
    
    // Registrar o request de IA
    await logAIRequest(user.uid, AI_REQUEST_TYPES.PREVISAO_SEMANAL, {
      signo: signoUsuario,
      semana: getCurrentWeek(),
      timestamp: new Date().toISOString()
    });
    
    // Gerar previsão
    const previsao = await gerarPrevisaoIA();
    
    setPrevisao(previsao);
    
  } catch (error) {
    console.error('Erro na previsão:', error);
  } finally {
    setLoading(false);
  }
};
```

### 5. **Exemplo no Mapa Astral**
```javascript
// src/pages/MapaAstral.jsx
import { logAIRequest, AI_REQUEST_TYPES } from '../utils/aiTracking';

// Dentro da função de geração do mapa
const gerarMapaAstral = async (dadosNascimento) => {
  try {
    setLoading(true);
    
    // Registrar o request de IA
    await logAIRequest(user.uid, AI_REQUEST_TYPES.MAPA_ASTRAL, {
      dataNascimento: dadosNascimento.data,
      local: dadosNascimento.local,
      horario: dadosNascimento.horario,
      timestamp: new Date().toISOString()
    });
    
    // Gerar mapa astral
    const mapa = await gerarMapaAstralIA(dadosNascimento);
    
    setMapaAstral(mapa);
    
  } catch (error) {
    console.error('Erro no mapa astral:', error);
  } finally {
    setLoading(false);
  }
};
```

## 📈 Estrutura da Collection `ai_requests`

### **Documento Exemplo:**
```javascript
{
  userId: "user123",
  type: "tarot",
  timestamp: Timestamp(2024-01-15 14:30:00),
  date: "2024-01-15",
  metadata: {
    pergunta: "Como será meu amor?",
    cartas: 3,
    timestamp: "2024-01-15T14:30:00.000Z"
  }
}
```

### **Campos:**
- `userId` - ID do usuário que fez o request
- `type` - Tipo de request (tarot, chat, previsao_semanal, etc)
- `timestamp` - Timestamp do Firebase para ordenação
- `date` - Data em formato YYYY-MM-DD para consultas eficientes
- `metadata` - Dados específicos do request (opcional)

## 📊 Analytics no Admin

### **Query para Hoje:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const aiRequestsSnap = await getDocs(query(
  collection(db, 'ai_requests'), 
  where('timestamp', '>=', today),
  orderBy('timestamp', 'desc')
));

const requestsToday = aiRequestsSnap.size;
```

### **Query por Tipo:**
```javascript
const tarotRequestsSnap = await getDocs(query(
  collection(db, 'ai_requests'),
  where('type', '==', 'tarot'),
  where('timestamp', '>=', today)
));

const tarotRequestsToday = tarotRequestsSnap.size;
```

### **Query por Usuário:**
```javascript
const userRequestsSnap = await getDocs(query(
  collection(db, 'ai_requests'),
  where('userId', '==', userId),
  orderBy('timestamp', 'desc'),
  limit(50)
));
```

## 🎯 Tipos de Requests Disponíveis

```javascript
export const AI_REQUEST_TYPES = {
  TAROT: 'tarot',                    // Leituras de tarot
  CHAT: 'chat',                      // Conversas com Catia
  PREVISAO_SEMANAL: 'previsao_semanal', // Previsões semanais
  MAPA_ASTRAL: 'mapa_astral',        // Mapas astrais
  RECEITA_SUGESTAO: 'receita_sugestao', // Sugestões de receitas
  DIARIO_ANALISE: 'diario_analise'   // Análises do diário
};
```

## 🚀 Implementação Gradual

### **Fase 1: Páginas Principais** ✅
- [x] Dashboard admin com indicador
- [x] Utilitário de tracking criado
- [ ] Implementar no Tarot
- [ ] Implementar no CatiaChat

### **Fase 2: Páginas Secundárias**
- [ ] Implementar na PrevisaoSemanal
- [ ] Implementar no MapaAstral
- [ ] Implementar em sugestões de receitas

### **Fase 3: Analytics Avançados**
- [ ] Gráficos por período
- [ ] Breakdown por tipo de request
- [ ] Usuários mais ativos
- [ ] Horários de pico

## 📋 Para Implementar Agora

### **1. Página Tarot:**
```javascript
// Adicionar no início da função de leitura
await logAIRequest(user.uid, AI_REQUEST_TYPES.TAROT, {
  pergunta: pergunta,
  cartas: cartasSelecionadas.length
});
```

### **2. Página CatiaChat:**
```javascript
// Adicionar no envio de mensagem
await logAIRequest(user.uid, AI_REQUEST_TYPES.CHAT, {
  messageLength: message.length,
  sessionId: currentSessionId
});
```

### **3. Previsão Semanal:**
```javascript
// Adicionar na geração de áudio
await logAIRequest(user.uid, AI_REQUEST_TYPES.PREVISAO_SEMANAL, {
  signo: signoUsuario,
  semana: getCurrentWeek()
});
```

---

## 🎯 **Resultado Final**

✅ **Indicador no Dashboard** - "Requests IA Hoje: 47"  
✅ **Sistema de Tracking** - Função `logAIRequest()`  
✅ **Tipos Padronizados** - `AI_REQUEST_TYPES`  
✅ **Collection Firestore** - `ai_requests`  
✅ **Analytics Prontos** - Queries para relatórios  

**Agora você pode rastrear todos os requests de IA e monitorar o uso das funcionalidades inteligentes do app!** 🤖📊 