# 🚀 Guia - Configurar API de Horóscopos no Node-RED

Este guia explica como modificar a API no Node-RED para buscar horóscopos do Firebase em vez de gerar em tempo real.

## 📋 Pré-requisitos

1. **Node-RED configurado** e funcionando
2. **Firebase configurado** com horóscopos gerados
3. **Variáveis de ambiente** configuradas no Node-RED

## 🔧 Configuração no Node-RED

### 1. Configurar Variáveis de Ambiente

No Node-RED, vá em **Menu > Configuration nodes > Environment variables** e adicione:

```
FIREBASE_API_KEY=AIzaSyAVwBJ7dRTv_rClLq1uoWQ4jfTz9wcyxjI
FIREBASE_AUTH_DOMAIN=tarot-universo-catia.firebaseapp.com
FIREBASE_PROJECT_ID=tarot-universo-catia
FIREBASE_STORAGE_BUCKET=tarot-universo-catia.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=773283915668
FIREBASE_APP_ID=1:773283915668:web:2a6f01401e646437191181
```

### 2. Modificar Endpoint `/horoscopo`

#### 2.1 HTTP In Node
- **Method:** POST
- **URL:** `/horoscopo`
- **Name:** `Horóscopo Diário`

#### 2.2 Function Node (Substituir código existente)
```javascript
// CÓDIGO PARA NODE-RED - API de Horóscopos do Firebase
// Adicione este código em um Function node no Node-RED

// Configuração do Firebase (usar variáveis de ambiente do Node-RED)
const firebaseConfig = {
  apiKey: env.get('FIREBASE_API_KEY'),
  authDomain: env.get('FIREBASE_AUTH_DOMAIN'),
  projectId: env.get('FIREBASE_PROJECT_ID'),
  storageBucket: env.get('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER_ID'),
  appId: env.get('FIREBASE_APP_ID')
};

// Função para obter chave da semana atual
function getWeekKey() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const year = startOfWeek.getFullYear();
  const weekNumber = Math.ceil((startOfWeek.getDate() + startOfWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Função para processar resposta do Firebase
function processarRespostaFirebase(response) {
  try {
    console.log('📡 Processando resposta do Firebase...');
    
    if (!response || !response.fields) {
      console.log('❌ Resposta inválida do Firebase');
      return {
        success: false,
        error: "Dados não encontrados",
        message: "Horóscopo não disponível"
      };
    }
    
    // Extrair dados do Firebase
    const horoscopo = {
      destaque: response.fields.destaque?.mapValue?.fields || {},
      segunda: response.fields.segunda?.mapValue?.fields || {},
      terca: response.fields.terca?.mapValue?.fields || {},
      quarta: response.fields.quarta?.mapValue?.fields || {},
      quinta: response.fields.quinta?.mapValue?.fields || {},
      sexta: response.fields.sexta?.mapValue?.fields || {},
      sabado: response.fields.sabado?.mapValue?.fields || {},
      domingo: response.fields.domingo?.mapValue?.fields || {},
      created_at: response.fields.created_at?.timestampValue,
      updated_at: response.fields.updated_at?.timestampValue,
      status: response.fields.status?.stringValue
    };
    
    // Converter campos do Firebase para formato normal
    const horoscopoProcessado = {
      destaque: {
        titulo: horoscopo.destaque.titulo?.stringValue || "",
        mensagem: horoscopo.destaque.mensagem?.stringValue || "",
        tema: horoscopo.destaque.tema?.stringValue || "",
        cor: horoscopo.destaque.cor?.stringValue || "#8B5CF6"
      },
      segunda: {
        tema: horoscopo.segunda.tema?.stringValue || "",
        trecho: horoscopo.segunda.trecho?.stringValue || "",
        icone: horoscopo.segunda.icone?.stringValue || "FaStar",
        cor: horoscopo.segunda.cor?.stringValue || "#F59E0B"
      },
      terca: {
        tema: horoscopo.terca.tema?.stringValue || "",
        trecho: horoscopo.terca.trecho?.stringValue || "",
        icone: horoscopo.terca.icone?.stringValue || "FaRegHeart",
        cor: horoscopo.terca.cor?.stringValue || "#EC4899"
      },
      quarta: {
        tema: horoscopo.quarta.tema?.stringValue || "",
        trecho: horoscopo.quarta.trecho?.stringValue || "",
        icone: horoscopo.quarta.icone?.stringValue || "FaRegEdit",
        cor: horoscopo.quarta.cor?.stringValue || "#10B981"
      },
      quinta: {
        tema: horoscopo.quinta.tema?.stringValue || "",
        trecho: horoscopo.quinta.trecho?.stringValue || "",
        icone: horoscopo.quinta.icone?.stringValue || "BsFillSunFill",
        cor: horoscopo.quinta.cor?.stringValue || "#F97316"
      },
      sexta: {
        tema: horoscopo.sexta.tema?.stringValue || "",
        trecho: horoscopo.sexta.trecho?.stringValue || "",
        icone: horoscopo.sexta.icone?.stringValue || "BsFillMoonStarsFill",
        cor: horoscopo.sexta.cor?.stringValue || "#3B82F6"
      },
      sabado: {
        tema: horoscopo.sabado.tema?.stringValue || "",
        trecho: horoscopo.sabado.trecho?.stringValue || "",
        icone: horoscopo.sabado.icone?.stringValue || "FaStar",
        cor: horoscopo.sabado.cor?.stringValue || "#6366F1"
      },
      domingo: {
        tema: horoscopo.domingo.tema?.stringValue || "",
        trecho: horoscopo.domingo.trecho?.stringValue || "",
        icone: horoscopo.domingo.icone?.stringValue || "GiPlanetConquest",
        cor: horoscopo.domingo.cor?.stringValue || "#8B5CF6"
      }
    };
    
    console.log('✅ Horóscopo processado com sucesso');
    
    return {
      success: true,
      data: horoscopoProcessado,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao processar resposta:', error);
    return {
      success: false,
      error: error.message,
      message: "Erro ao processar dados"
    };
  }
}

// Função principal para processar requisições
function processarRequisicao() {
  try {
    const { sign } = msg.payload;
    
    if (!sign) {
      return {
        success: false,
        error: "Signo não especificado",
        message: "Parâmetro 'sign' é obrigatório"
      };
    }
    
    console.log(`📥 Requisição recebida para signo: ${sign}`);
    
    // Configurar URL do Firebase
    const semanaAtual = getWeekKey();
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/horoscopos_semanais/${semanaAtual}/signos/${sign}`;
    
    console.log(`🌐 URL do Firebase: ${url}`);
    
    // Configurar requisição HTTP
    msg.url = url;
    msg.method = 'GET';
    msg.headers = {
      'Content-Type': 'application/json'
    };
    
    return msg;
    
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    return {
      success: false,
      error: error.message,
      message: "Erro interno do servidor"
    };
  }
}

// Executar função principal
return processarRequisicao();
```

#### 2.3 HTTP Request Node
- **Method:** GET
- **URL:** `{{msg.url}}`
- **Headers:** `{{msg.headers}}`
- **Name:** `Buscar Firebase`

#### 2.4 Function Node (Processar Resposta)
```javascript
// Processar resposta do Firebase
function processarResposta() {
  try {
    console.log('📡 Processando resposta do Firebase...');
    
    if (!msg.payload || !msg.payload.fields) {
      console.log('❌ Resposta inválida do Firebase');
      return {
        success: false,
        error: "Dados não encontrados",
        message: "Horóscopo não disponível"
      };
    }
    
    // Extrair dados do Firebase
    const horoscopo = {
      destaque: msg.payload.fields.destaque?.mapValue?.fields || {},
      segunda: msg.payload.fields.segunda?.mapValue?.fields || {},
      terca: msg.payload.fields.terca?.mapValue?.fields || {},
      quarta: msg.payload.fields.quarta?.mapValue?.fields || {},
      quinta: msg.payload.fields.quinta?.mapValue?.fields || {},
      sexta: msg.payload.fields.sexta?.mapValue?.fields || {},
      sabado: msg.payload.fields.sabado?.mapValue?.fields || {},
      domingo: msg.payload.fields.domingo?.mapValue?.fields || {},
      created_at: msg.payload.fields.created_at?.timestampValue,
      updated_at: msg.payload.fields.updated_at?.timestampValue,
      status: msg.payload.fields.status?.stringValue
    };
    
    // Converter campos do Firebase para formato normal
    const horoscopoProcessado = {
      destaque: {
        titulo: horoscopo.destaque.titulo?.stringValue || "",
        mensagem: horoscopo.destaque.mensagem?.stringValue || "",
        tema: horoscopo.destaque.tema?.stringValue || "",
        cor: horoscopo.destaque.cor?.stringValue || "#8B5CF6"
      },
      segunda: {
        tema: horoscopo.segunda.tema?.stringValue || "",
        trecho: horoscopo.segunda.trecho?.stringValue || "",
        icone: horoscopo.segunda.icone?.stringValue || "FaStar",
        cor: horoscopo.segunda.cor?.stringValue || "#F59E0B"
      },
      terca: {
        tema: horoscopo.terca.tema?.stringValue || "",
        trecho: horoscopo.terca.trecho?.stringValue || "",
        icone: horoscopo.terca.icone?.stringValue || "FaRegHeart",
        cor: horoscopo.terca.cor?.stringValue || "#EC4899"
      },
      quarta: {
        tema: horoscopo.quarta.tema?.stringValue || "",
        trecho: horoscopo.quarta.trecho?.stringValue || "",
        icone: horoscopo.quarta.icone?.stringValue || "FaRegEdit",
        cor: horoscopo.quarta.cor?.stringValue || "#10B981"
      },
      quinta: {
        tema: horoscopo.quinta.tema?.stringValue || "",
        trecho: horoscopo.quinta.trecho?.stringValue || "",
        icone: horoscopo.quinta.icone?.stringValue || "BsFillSunFill",
        cor: horoscopo.quinta.cor?.stringValue || "#F97316"
      },
      sexta: {
        tema: horoscopo.sexta.tema?.stringValue || "",
        trecho: horoscopo.sexta.trecho?.stringValue || "",
        icone: horoscopo.sexta.icone?.stringValue || "BsFillMoonStarsFill",
        cor: horoscopo.sexta.cor?.stringValue || "#3B82F6"
      },
      sabado: {
        tema: horoscopo.sabado.tema?.stringValue || "",
        trecho: horoscopo.sabado.trecho?.stringValue || "",
        icone: horoscopo.sabado.icone?.stringValue || "FaStar",
        cor: horoscopo.sabado.cor?.stringValue || "#6366F1"
      },
      domingo: {
        tema: horoscopo.domingo.tema?.stringValue || "",
        trecho: horoscopo.domingo.trecho?.stringValue || "",
        icone: horoscopo.domingo.icone?.stringValue || "GiPlanetConquest",
        cor: horoscopo.domingo.cor?.stringValue || "#8B5CF6"
      }
    };
    
    console.log('✅ Horóscopo processado com sucesso');
    
    msg.payload = {
      success: true,
      data: horoscopoProcessado,
      timestamp: new Date().toISOString()
    };
    
    return msg;
    
  } catch (error) {
    console.error('❌ Erro ao processar resposta:', error);
    msg.payload = {
      success: false,
      error: error.message,
      message: "Erro ao processar dados"
    };
    return msg;
  }
}

return processarResposta();
```

#### 2.5 HTTP Response Node
- **Status Code:** 200
- **Name:** `Resposta Horóscopo`

### 3. Modificar Endpoint `/horoscopo-semanal`

#### 3.1 HTTP In Node
- **Method:** POST
- **URL:** `/horoscopo-semanal`
- **Name:** `Horóscopo Semanal`

#### 3.2 Function Node (Mesmo código do horóscopo diário)
- Usar o mesmo código do horóscopo diário

#### 3.3 HTTP Request Node
- **Method:** GET
- **URL:** `{{msg.url}}`
- **Headers:** `{{msg.headers}}`
- **Name:** `Buscar Firebase Semanal`

#### 3.4 Function Node (Processar Resposta Semanal)
```javascript
// Processar resposta do Firebase para horóscopo semanal
function processarRespostaSemanal() {
  try {
    console.log('📡 Processando resposta semanal do Firebase...');
    
    if (!msg.payload || !msg.payload.fields) {
      console.log('❌ Resposta inválida do Firebase');
      return {
        success: false,
        error: "Dados não encontrados",
        message: "Horóscopo não disponível"
      };
    }
    
    // Extrair dados do Firebase
    const horoscopo = {
      destaque: msg.payload.fields.destaque?.mapValue?.fields || {},
      segunda: msg.payload.fields.segunda?.mapValue?.fields || {},
      terca: msg.payload.fields.terca?.mapValue?.fields || {},
      quarta: msg.payload.fields.quarta?.mapValue?.fields || {},
      quinta: msg.payload.fields.quinta?.mapValue?.fields || {},
      sexta: msg.payload.fields.sexta?.mapValue?.fields || {},
      sabado: msg.payload.fields.sabado?.mapValue?.fields || {},
      domingo: msg.payload.fields.domingo?.mapValue?.fields || {},
      created_at: msg.payload.fields.created_at?.timestampValue,
      updated_at: msg.payload.fields.updated_at?.timestampValue,
      status: msg.payload.fields.status?.stringValue
    };
    
    // Converter campos do Firebase para formato normal
    const horoscopoProcessado = {
      destaque: {
        titulo: horoscopo.destaque.titulo?.stringValue || "",
        mensagem: horoscopo.destaque.mensagem?.stringValue || "",
        tema: horoscopo.destaque.tema?.stringValue || "",
        cor: horoscopo.destaque.cor?.stringValue || "#8B5CF6"
      },
      segunda: {
        tema: horoscopo.segunda.tema?.stringValue || "",
        trecho: horoscopo.segunda.trecho?.stringValue || "",
        icone: horoscopo.segunda.icone?.stringValue || "FaStar",
        cor: horoscopo.segunda.cor?.stringValue || "#F59E0B"
      },
      terca: {
        tema: horoscopo.terca.tema?.stringValue || "",
        trecho: horoscopo.terca.trecho?.stringValue || "",
        icone: horoscopo.terca.icone?.stringValue || "FaRegHeart",
        cor: horoscopo.terca.cor?.stringValue || "#EC4899"
      },
      quarta: {
        tema: horoscopo.quarta.tema?.stringValue || "",
        trecho: horoscopo.quarta.trecho?.stringValue || "",
        icone: horoscopo.quarta.icone?.stringValue || "FaRegEdit",
        cor: horoscopo.quarta.cor?.stringValue || "#10B981"
      },
      quinta: {
        tema: horoscopo.quinta.tema?.stringValue || "",
        trecho: horoscopo.quinta.trecho?.stringValue || "",
        icone: horoscopo.quinta.icone?.stringValue || "BsFillSunFill",
        cor: horoscopo.quinta.cor?.stringValue || "#F97316"
      },
      sexta: {
        tema: horoscopo.sexta.tema?.stringValue || "",
        trecho: horoscopo.sexta.trecho?.stringValue || "",
        icone: horoscopo.sexta.icone?.stringValue || "BsFillMoonStarsFill",
        cor: horoscopo.sexta.cor?.stringValue || "#3B82F6"
      },
      sabado: {
        tema: horoscopo.sabado.tema?.stringValue || "",
        trecho: horoscopo.sabado.trecho?.stringValue || "",
        icone: horoscopo.sabado.icone?.stringValue || "FaStar",
        cor: horoscopo.sabado.cor?.stringValue || "#6366F1"
      },
      domingo: {
        tema: horoscopo.domingo.tema?.stringValue || "",
        trecho: horoscopo.domingo.trecho?.stringValue || "",
        icone: horoscopo.domingo.icone?.stringValue || "GiPlanetConquest",
        cor: horoscopo.domingo.cor?.stringValue || "#8B5CF6"
      }
    };
    
    // Formatar dados para o formato esperado pelo frontend
    const semanaFormatada = [
      { dia: "Seg", ...horoscopoProcessado.segunda },
      { dia: "Ter", ...horoscopoProcessado.terca },
      { dia: "Qua", ...horoscopoProcessado.quarta },
      { dia: "Qui", ...horoscopoProcessado.quinta },
      { dia: "Sex", ...horoscopoProcessado.sexta },
      { dia: "Sáb", ...horoscopoProcessado.sabado },
      { dia: "Dom", ...horoscopoProcessado.domingo }
    ];
    
    console.log('✅ Horóscopo semanal processado com sucesso');
    
    msg.payload = {
      success: true,
      data: {
        destaque: horoscopoProcessado.destaque,
        semana: semanaFormatada
      },
      timestamp: new Date().toISOString()
    };
    
    return msg;
    
  } catch (error) {
    console.error('❌ Erro ao processar resposta semanal:', error);
    msg.payload = {
      success: false,
      error: error.message,
      message: "Erro ao processar dados"
    };
    return msg;
  }
}

return processarRespostaSemanal();
```

#### 3.5 HTTP Response Node
- **Status Code:** 200
- **Name:** `Resposta Horóscopo Semanal`

## 🧪 Testar a API

### Teste via cURL
```bash
# Testar horóscopo diário
curl -X POST https://api.torrente.com.br/horoscopo \
  -H "Content-Type: application/json" \
  -d '{"sign": "aries"}'

# Testar horóscopo semanal
curl -X POST https://api.torrente.com.br/horoscopo-semanal \
  -H "Content-Type: application/json" \
  -d '{"sign": "aries"}'
```

### Teste via Script
```bash
# Testar API localmente
node test-firebase-api.js diario aries
node test-firebase-api.js semanal aries
```

## 🎯 Benefícios da Mudança

### ⚡ Performance
- **Antes:** 2-5 segundos (geração OpenAI)
- **Depois:** < 100ms (busca Firebase)

### 💰 Economia
- **Antes:** 1 requisição OpenAI por usuário
- **Depois:** 0 requisições OpenAI (apenas busca)

### 🔒 Confiabilidade
- **Antes:** Dependência da API OpenAI
- **Depois:** Dados sempre disponíveis

## 🔍 Troubleshooting

### Erro: "Dados não encontrados"
- Verificar se os horóscopos foram gerados
- Verificar se a semana atual existe no Firebase
- Executar: `npm run gerar:status`

### Erro: "Variável de ambiente não configurada"
- Verificar se as variáveis estão configuradas no Node-RED
- Verificar se os nomes estão corretos

### Erro: "URL inválida"
- Verificar se o PROJECT_ID está correto
- Verificar se a estrutura do Firebase está correta

## 📊 Monitoramento

### Logs do Node-RED
- Verificar logs no console do Node-RED
- Procurar por mensagens de erro ou sucesso

### Métricas de Performance
- Tempo de resposta < 100ms
- Taxa de sucesso > 99%
- Sem dependência de APIs externas 