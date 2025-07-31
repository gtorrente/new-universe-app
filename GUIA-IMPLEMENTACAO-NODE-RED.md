# 🛠️ GUIA: Implementar Geração de Horóscopo no Node-RED

## 🚨 **PROBLEMA IDENTIFICADO**

A função que você mostrou é apenas para **LEITURA** de dados do Firestore, não para **GERAÇÃO**. Por isso o CRON de 06:00 não está funcionando - **ele não existe**!

## 🎯 **SOLUÇÃO COMPLETA**

### **FLOW 1: Geração Automática (NOVO - CRIAR ESTE!)**

```
⏰ CRON → 🔄 Function Gerar → 📤 Split → 🤖 HTTP CatIA → 💾 Function Salvar → 🔥 HTTP Firestore → 📊 Join → ✅ Log Final
```

#### **1️⃣ CRON Node (Timestamp)**
- **Schedule:** `0 6 * * *` (06:00 diário)
- **Timezone:** `America/Sao_Paulo`
- **Output:** Trigger às 06:00

#### **2️⃣ Function "Gerar Horoscopo Diario"**
```javascript
// COLAR O CÓDIGO DO ARQUIVO: FUNCAO-GERACAO-HOROSCOPO-NODE-RED.js
// (sem a última linha "return [mensagens];" - usar só "return mensagens;")

console.log('🚀 INICIANDO GERAÇÃO AUTOMÁTICA...');

const signos = [
  { en: 'aries', pt: 'Áries' },
  { en: 'taurus', pt: 'Touro' },
  // ... todos os 12 signos
];

const dataChave = formatarDataChave(new Date());
const mensagens = [];

signos.forEach(signo => {
  mensagens.push({
    payload: {
      signo: signo.en,
      signo_nome: signo.pt,
      data: dataChave
    }
  });
});

return mensagens; // Array de 12 mensagens
```

#### **3️⃣ Split Node**
- **Property:** `msg`
- **Array Length:** `msg.length`
- Vai processar um signo por vez

#### **4️⃣ HTTP Request "Chamar CatIA"**
- **Method:** POST
- **URL:** `https://api.openai.com/v1/chat/completions` (ou sua API)
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer SEU_TOKEN`
- **Body:** JSON with prompt para o signo

#### **5️⃣ Function "Processar Resposta CatIA"**
```javascript
// Extrair texto do horóscopo da resposta
const horoscopoTexto = msg.payload.choices[0].message.content;

// Preparar para salvar no Firestore
msg.horoscopo_final = {
  signo: msg.payload.signo,
  texto: horoscopoTexto,
  data: msg.payload.data
};

return msg;
```

#### **6️⃣ Function "Salvar Firestore"**
```javascript
// COLAR O CÓDIGO DO ARQUIVO: FUNCAO-SALVAR-FIRESTORE-NODE-RED.js
// (ajustar conforme necessário)

const urlFirestore = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${data}/signos/${signo}`;

msg.url = urlFirestore;
msg.method = 'PATCH';
msg.payload = documentoFirestore;

return msg;
```

#### **7️⃣ HTTP Request "Salvar Firestore"**
- **Method:** PATCH
- **URL:** `{{url}}` (da mensagem)
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer SEU_TOKEN_FIREBASE`

#### **8️⃣ Join Node**
- **Mode:** Automatic
- **Count:** 12 (para aguardar todos os signos)

#### **9️⃣ Function "Log Final"**
```javascript
console.log('✅ GERAÇÃO COMPLETA!');
console.log('📊 Processados:', msg.payload.length, 'signos');
console.log('⏰ Concluído em:', new Date().toLocaleString('pt-BR'));
return msg;
```

### **FLOW 2: API Pública (JÁ EXISTE)**

Este é o flow que você já tem com a função de leitura.

## 🚀 **IMPLEMENTAÇÃO IMEDIATA**

### **1️⃣ Emergency Fix - Executar Manualmente HOJE:**

1. **Criar Inject node** com timestamp
2. **Conectar ao flow de geração** (criar temporariamente)
3. **Executar manualmente** para gerar horóscopo de hoje
4. **Verificar se salvou** no Firestore corretamente

### **2️⃣ Configurar CRON para Amanhã:**

1. **Implementar flow completo** como descrito acima
2. **Testar às 18:00** hoje (horário de teste)
3. **Confirmar funcionamento** antes de 06:00 de amanhã

### **3️⃣ Verificar Tokens e Permissões:**

- **Token OpenAI/CatIA:** Para gerar horóscopo
- **Token Firebase:** Para salvar no Firestore
- **Permissões:** Write access no projeto `tarot-universo-catia`

## 🔧 **CONFIGURAÇÕES IMPORTANTES**

### **Timezone:**
```
America/Sao_Paulo (-03:00)
```

### **CRON Expression:**
```
0 6 * * *  (06:00 todos os dias)
```

### **URL Firestore Pattern:**
```
horoscopos_diarios/{YYYY-MM-DD}/signos/{signo}
```

### **Estrutura Documento:**
```json
{
  "fields": {
    "mensagem": {"stringValue": "texto_do_horoscopo"},
    "signo": {"stringValue": "aries"},
    "nome_signo": {"stringValue": "Áries"},
    "data": {"stringValue": "2025-07-29"},
    "fonte": {"stringValue": "catia-fonseca"}
  }
}
```

## ⚡ **AÇÃO IMEDIATA NECESSÁRIA**

### **HOJE (Emergency):**
1. ✅ **Criar flow de geração** (30 min)
2. ✅ **Executar manualmente** para hoje (5 min)
3. ✅ **Verificar app funcionando** (5 min)

### **HOJE (Setup):**
4. ✅ **Configurar CRON** para amanhã (10 min)
5. ✅ **Testar flow completo** (15 min)
6. ✅ **Documentar logs** para monitoramento (5 min)

**Total:** ~70 minutos para resolver completamente

## 📊 **RESULTADO ESPERADO**

### **Após Implementação:**
- ✅ **06:00 diário:** Gera automaticamente 12 horóscopos
- ✅ **App funcionando:** Usuários veem horóscopo real
- ✅ **Fallback:** Usa dia anterior se geração falhar
- ✅ **Logs:** Monitoramento completo do processo

**O problema é que faltava o flow de GERAÇÃO! Agora você tem o blueprint completo.** 🎯 