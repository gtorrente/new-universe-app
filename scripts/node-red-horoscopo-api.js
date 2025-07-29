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

// Função para obter chave da próxima semana
function getNextWeekKey() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const startOfNextWeek = new Date(nextWeek.setDate(nextWeek.getDate() - nextWeek.getDay()));
  const year = startOfNextWeek.getFullYear();
  const weekNumber = Math.ceil((startOfNextWeek.getDate() + startOfNextWeek.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Mapeamento de signos em português
const nomesSignos = {
  aries: "Áries",
  taurus: "Touro",
  gemini: "Gêmeos",
  cancer: "Câncer",
  leo: "Leão",
  virgo: "Virgem",
  libra: "Libra",
  scorpio: "Escorpião",
  sagittarius: "Sagitário",
  capricorn: "Capricórnio",
  aquarius: "Aquário",
  pisces: "Peixes"
};

// Função principal
async function buscarHoroscopoDoFirebase(signo) {
  try {
    console.log(`🔍 Buscando horóscopo para ${signo} no Firebase...`);
    
    const semanaAtual = getWeekKey();
    const proximaSemana = getNextWeekKey();
    
    console.log(`📅 Semana atual: ${semanaAtual}`);
    console.log(`📅 Próxima semana: ${proximaSemana}`);
    
    // Tentar buscar da semana atual primeiro
    let horoscopo = await buscarHoroscopoSemana(signo, semanaAtual);
    
    // Se não encontrar, buscar da próxima semana
    if (!horoscopo) {
      console.log(`⚠️ Horóscopo não encontrado na semana atual, buscando próxima semana...`);
      horoscopo = await buscarHoroscopoSemana(signo, proximaSemana);
    }
    
    if (horoscopo) {
      console.log(`✅ Horóscopo encontrado para ${signo}`);
      return {
        success: true,
        data: horoscopo,
        semana: horoscopo.semana || semanaAtual,
        timestamp: new Date().toISOString()
      };
    } else {
      console.log(`❌ Horóscopo não encontrado para ${signo}`);
      return {
        success: false,
        error: "Horóscopo não encontrado",
        message: "Horóscopo não disponível para este signo/semana"
      };
    }
    
  } catch (error) {
    console.error(`❌ Erro ao buscar horóscopo para ${signo}:`, error);
    return {
      success: false,
      error: error.message,
      message: "Erro interno do servidor"
    };
  }
}

// Função para buscar horóscopo de uma semana específica
async function buscarHoroscopoSemana(signo, semana) {
  try {
    // URL para buscar no Firebase (via HTTP Request node)
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/horoscopos_semanais/${semana}/signos/${signo}`;
    
    console.log(`🌐 Fazendo requisição para: ${url}`);
    
    // Configurar requisição HTTP
    msg.url = url;
    msg.method = 'GET';
    msg.headers = {
      'Content-Type': 'application/json'
    };
    
    // Retornar configuração para HTTP Request node
    return {
      url: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
  } catch (error) {
    console.error(`❌ Erro ao buscar horóscopo da semana ${semana}:`, error);
    return null;
  }
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

// Função para buscar horóscopo semanal (todos os dias da semana)
function buscarHoroscopoSemanal(signo) {
  try {
    console.log(`🔍 Buscando horóscopo semanal para ${signo}...`);
    
    const semanaAtual = getWeekKey();
    
    // Buscar horóscopo da semana atual
    const horoscopo = await buscarHoroscopoDoFirebase(signo);
    
    if (horoscopo.success) {
      // Formatar dados para o formato esperado pelo frontend
      const semanaFormatada = [
        { dia: "Seg", ...horoscopo.data.segunda },
        { dia: "Ter", ...horoscopo.data.terca },
        { dia: "Qua", ...horoscopo.data.quarta },
        { dia: "Qui", ...horoscopo.data.quinta },
        { dia: "Sex", ...horoscopo.data.sexta },
        { dia: "Sáb", ...horoscopo.data.sabado },
        { dia: "Dom", ...horoscopo.data.domingo }
      ];
      
      return {
        success: true,
        data: {
          destaque: horoscopo.data.destaque,
          semana: semanaFormatada
        },
        timestamp: new Date().toISOString()
      };
    } else {
      return horoscopo;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao buscar horóscopo semanal para ${signo}:`, error);
    return {
      success: false,
      error: error.message,
      message: "Erro ao buscar horóscopo semanal"
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
    
    if (isSemanal) {
      return buscarHoroscopoSemanal(sign);
    } else {
      return buscarHoroscopoDoFirebase(sign);
    }
    
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