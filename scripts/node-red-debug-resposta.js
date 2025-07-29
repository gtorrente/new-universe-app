// CÓDIGO DE DEBUG - VERIFICAR RESPOSTA DO HTTP REQUEST
// Adicione este código em um Function node entre "http request" e "Processar Resposta"

console.log('🔍 DEBUG: VERIFICANDO RESPOSTA DO HTTP REQUEST...');

// Verificar se há payload
if (!msg.payload) {
  console.error('❌ DEBUG: msg.payload está vazio');
  msg.payload = {
    success: false,
    error: "Payload vazio",
    message: "Nenhum dado recebido"
  };
  return msg;
}

// Verificar tipo de payload
console.log('📋 DEBUG: Tipo do payload:', typeof msg.payload);
console.log('📋 DEBUG: Payload é string?', typeof msg.payload === 'string');
console.log('📋 DEBUG: Payload é objeto?', typeof msg.payload === 'object');

// Se for string, tentar fazer parse
if (typeof msg.payload === 'string') {
  try {
    console.log('🔄 DEBUG: Tentando fazer parse da string...');
    const parsed = JSON.parse(msg.payload);
    console.log('✅ DEBUG: Parse bem-sucedido:', parsed);
    msg.payload = parsed;
  } catch (error) {
    console.error('❌ DEBUG: Erro no parse:', error);
    console.log('📄 DEBUG: Conteúdo da string:', msg.payload.substring(0, 200));
  }
}

// Verificar estrutura do payload
if (typeof msg.payload === 'object') {
  console.log('📊 DEBUG: Chaves do objeto:', Object.keys(msg.payload));
  
  if (msg.payload.fields) {
    console.log('✅ DEBUG: Campo "fields" encontrado');
    console.log('📋 DEBUG: Chaves do fields:', Object.keys(msg.payload.fields));
  } else {
    console.log('❌ DEBUG: Campo "fields" NÃO encontrado');
  }
  
  if (msg.payload.error) {
    console.log('❌ DEBUG: Erro encontrado:', msg.payload.error);
  }
}

// Verificar status code
if (msg.statusCode) {
  console.log('📊 DEBUG: Status Code:', msg.statusCode);
}

// Verificar headers
if (msg.headers) {
  console.log('📋 DEBUG: Headers recebidos:', Object.keys(msg.headers));
}

// Continuar com o fluxo normal
console.log('✅ DEBUG: Continuando fluxo...');
return msg; 