// CÓDIGO PARA PROCESSAR RESPOSTA DIÁRIA DO FIREBASE
// Adicione este código no Function node "Processar Resposta Diario"

console.log('🔄 PROCESSANDO RESPOSTA DIÁRIA DO FIREBASE...');

// Verificar se há resposta do HTTP Request
if (!msg.payload) {
  console.error('❌ Nenhuma resposta recebida');
  msg.payload = {
    success: false,
    error: "Nenhuma resposta do Firebase",
    message: "Dados não encontrados"
  };
  return msg;
}

console.log('📥 Resposta recebida:', typeof msg.payload);

// Verificar se é uma resposta de erro
if (msg.payload.error || msg.payload.success === false) {
  console.error('❌ Erro na resposta:', msg.payload);
  return msg;
}

// Verificar se é uma resposta do Firebase
if (msg.payload.fields) {
  console.log('✅ Resposta do Firebase detectada (DIÁRIO)');
  
  try {
    // Processar dados do Firebase
    const dados = msg.payload.fields;
    
    // Extrair dados do horóscopo diário
    const horoscopoProcessado = {
      mensagem: dados.mensagem?.stringValue || "Horóscopo indisponível.",
      signo: dados.signo?.stringValue || msg.signo || "aries",
      nome_signo: dados.nome_signo?.stringValue || "Áries",
      dia_semana: dados.dia_semana?.stringValue || "hoje",
      data: dados.data?.stringValue || new Date().toISOString().split('T')[0],
      fonte: dados.fonte?.stringValue || "catia-fonseca"
    };
    
    // Montar resposta final
    const resposta = {
      success: true,
      data: {
        horoscopo: horoscopoProcessado,
        signo: horoscopoProcessado.signo,
        dia: horoscopoProcessado.data
      }
    };
    
    console.log('✅ Dados diários processados com sucesso:', resposta);
    msg.payload = resposta;
    
  } catch (error) {
    console.error('❌ Erro ao processar dados diários:', error);
    msg.payload = {
      success: false,
      error: "Erro ao processar dados do Firebase",
      message: error.message
    };
  }
  
} else {
  console.error('❌ Formato de resposta inválido:', msg.payload);
  msg.payload = {
    success: false,
    error: "Formato de resposta inválido",
    message: "Dados não estão no formato esperado"
  };
}

return msg; 