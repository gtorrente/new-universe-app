// FUNÇÃO NODE-RED: SALVAR HORÓSCOPO NO FIRESTORE
// Use esta função após receber resposta da API da CatIA
// Coloque em Function node chamado "Salvar Firestore"

console.log('💾 INICIANDO SALVAMENTO NO FIRESTORE...');
console.log('📦 Payload recebido:', JSON.stringify(msg.payload, null, 2));

// Extrair dados da resposta da CatIA
const { signo, signo_nome, data, dia_semana } = msg.payload;

// Verificar se temos resposta da CatIA (ajustar conforme sua API)
let horoscopoTexto = '';

if (msg.payload && msg.payload.choices && msg.payload.choices[0]) {
  // Resposta do OpenAI/ChatGPT
  horoscopoTexto = msg.payload.choices[0].message.content.trim();
} else if (msg.payload && msg.payload.response) {
  // Resposta de API customizada
  horoscopoTexto = msg.payload.response.trim();
} else if (msg.payload && msg.payload.text) {
  // Formato alternativo
  horoscopoTexto = msg.payload.text.trim();
} else {
  console.error('❌ Resposta da CatIA em formato não reconhecido');
  console.error('🔍 Estrutura do payload:', Object.keys(msg.payload));
  
  // Fallback: usar horóscopo padrão
  horoscopoTexto = `Hoje ${signo_nome} está em um momento especial de reflexão e crescimento. As energias cósmicas favorecem novas oportunidades e descobertas importantes sobre si mesmo. Mantenha-se aberto às possibilidades que o universo tem para oferecer.`;
}

console.log('📝 Texto do horóscopo gerado:', horoscopoTexto);

// Preparar documento para Firestore
const documentoFirestore = {
  fields: {
    mensagem: {
      stringValue: horoscopoTexto
    },
    signo: {
      stringValue: signo
    },
    nome_signo: {
      stringValue: signo_nome
    },
    dia_semana: {
      stringValue: dia_semana
    },
    data: {
      stringValue: data
    },
    fonte: {
      stringValue: "catia-fonseca"
    },
    gerado_em: {
      timestampValue: new Date().toISOString()
    },
    versao: {
      stringValue: "auto-v1"
    }
  }
};

// URL do Firestore para salvar
const urlFirestore = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${data}/signos/${signo}`;

console.log('🔥 URL Firestore:', urlFirestore);
console.log('📄 Documento a salvar:', JSON.stringify(documentoFirestore, null, 2));

// Configurar mensagem para HTTP Request (PUT/PATCH para criar/atualizar)
msg.url = urlFirestore;
msg.method = 'PATCH'; // ou 'PUT' se preferir
msg.headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer SEU_TOKEN_FIREBASE_AQUI' // Substitua pelo token real
};
msg.payload = documentoFirestore;

// Dados para tracking
msg.horoscopo_info = {
  signo: signo,
  signo_nome: signo_nome,
  data: data,
  texto_gerado: horoscopoTexto.substring(0, 50) + '...',
  timestamp: Date.now()
};

console.log('✅ Configuração para Firestore concluída');
console.log('🚀 Enviando para HTTP Request node...');

return msg; 