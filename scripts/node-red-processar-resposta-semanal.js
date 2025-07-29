// CÓDIGO PARA PROCESSAR RESPOSTA SEMANAL DO FIREBASE
// Adicione este código no Function node "Processar Resposta Semanal"

console.log('🔄 PROCESSANDO RESPOSTA SEMANAL DO FIREBASE...');

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
      titulo: destaque.titulo?.stringValue || "Horóscopo Semanal",
      mensagem: destaque.mensagem?.stringValue || "Mensagem da semana",
      mensagem_audio: destaque.mensagem_audio?.stringValue || destaque.mensagem?.stringValue || "Mensagem da semana",
      tema: destaque.tema?.stringValue || "Geral",
      cor: destaque.cor?.stringValue || "#8B5CF6"
    };
    
    // Extrair dados de todos os dias da semana
    const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const semanaProcessada = {};
    
    diasSemana.forEach(dia => {
      const diaData = dados[dia]?.mapValue?.fields || {};
      semanaProcessada[dia] = {
        tema: diaData.tema?.stringValue || "Geral",
        trecho: diaData.trecho?.stringValue || "Mensagem do dia",
        cor: diaData.cor?.stringValue || "#8B5CF6",
        icone: diaData.icone?.stringValue || "FaStar"
      };
    });
    
    // Montar resposta final
    const resposta = {
      success: true,
      data: {
        destaque: destaqueProcessado,
        semana: semanaProcessada,
        signo: msg.signo || "aries",
        semanaKey: msg.semana || "2025-W04"
      }
    };
    
    console.log('✅ Dados semanais processados com sucesso:', resposta);
    msg.payload = resposta;
    
  } catch (error) {
    console.error('❌ Erro ao processar dados semanais:', error);
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