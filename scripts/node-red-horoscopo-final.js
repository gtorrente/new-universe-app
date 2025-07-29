// CÓDIGO FINAL PARA NODE-RED - API de Horóscopos do Firebase
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

// Função para formatar horóscopo semanal
function formatarHoroscopoSemanal(horoscopo) {
  try {
    // Formatar dados para o formato esperado pelo frontend
    const semanaFormatada = [
      { dia: "Seg", ...horoscopo.segunda },
      { dia: "Ter", ...horoscopo.terca },
      { dia: "Qua", ...horoscopo.quarta },
      { dia: "Qui", ...horoscopo.quinta },
      { dia: "Sex", ...horoscopo.sexta },
      { dia: "Sáb", ...horoscopo.sabado },
      { dia: "Dom", ...horoscopo.domingo }
    ];
    
    return {
      success: true,
      data: {
        destaque: horoscopo.destaque,
        semana: semanaFormatada
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao formatar horóscopo semanal:', error);
    return {
      success: false,
      error: error.message,
      message: "Erro ao formatar dados"
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
    
    // Verificar se é horóscopo diário ou semanal
    const isSemanal = msg.req?.url?.includes('horoscopo-semanal');
    
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
    
    // Armazenar informações para processamento posterior
    msg.isSemanal = isSemanal;
    msg.signo = sign;
    msg.semana = semanaAtual;
    
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