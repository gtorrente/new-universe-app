// CÓDIGO PARA PROCESSAR RESPOSTA DO FIREBASE
// Adicione este código no Function node "Processar Resposta"

console.log('🔄 PROCESSANDO RESPOSTA DO FIREBASE...');

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
  console.log('✅ Resposta do Firebase detectada');
  
  try {
    // Processar dados do Firebase
    const dados = msg.payload.fields;
    
    // Extrair dados do destaque
    const destaque = dados.destaque?.mapValue?.fields || {};
    const destaqueProcessado = {
      titulo: destaque.titulo?.stringValue || "Horóscopo Diário",
      mensagem: destaque.mensagem?.stringValue || "Mensagem do dia",
      tema: destaque.tema?.stringValue || "Geral",
      cor: destaque.cor?.stringValue || "#8B5CF6"
    };
    
    // Extrair dados do dia específico (segunda-feira como exemplo)
    const segunda = dados.segunda?.mapValue?.fields || {};
    const diaProcessado = {
      tema: segunda.tema?.stringValue || "Geral",
      trecho: segunda.trecho?.stringValue || "Mensagem do dia",
      cor: segunda.cor?.stringValue || "#8B5CF6",
      icone: segunda.icone?.stringValue || "FaStar"
    };
    
    // Montar resposta final
    const resposta = {
      success: true,
      data: {
        destaque: destaqueProcessado,
        dia: diaProcessado,
        signo: msg.signo || "aries",
        semana: msg.semana || "2025-W04"
      }
    };
    
    console.log('✅ Dados processados com sucesso:', resposta);
    msg.payload = resposta;
    
  } catch (error) {
    console.error('❌ Erro ao processar dados:', error);
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