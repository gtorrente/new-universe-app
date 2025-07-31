// FUNÇÃO NODE-RED: GERAR HORÓSCOPO DIÁRIO (CRON 06:00)
// Esta é a função que FALTAVA! Para ser usada em CRON node que executa às 06:00
// Coloque este código em um Function node chamado "Gerar Horoscopo Diario"

console.log('🚀 INICIANDO GERAÇÃO AUTOMÁTICA DE HORÓSCOPO DIÁRIO - 06:00');
console.log('📅 Timestamp de execução:', new Date().toISOString());

// Função para obter data atual no fuso brasileiro
function getDataBrasileira() {
  const agora = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const partes = formatter.formatToParts(agora);
  const ano = parseInt(partes.find(p => p.type === 'year').value);
  const mes = parseInt(partes.find(p => p.type === 'month').value);
  const dia = parseInt(partes.find(p => p.type === 'day').value);
  const hora = parseInt(partes.find(p => p.type === 'hour').value);
  
  const dataBR = new Date(ano, mes - 1, dia, hora);
  console.log('🇧🇷 Data/hora Brasil:', dataBR.toLocaleString('pt-BR'));
  
  return dataBR;
}

// Função para formatar data como YYYY-MM-DD
function formatarDataChave(data) {
  const year = data.getFullYear();
  const month = (data.getMonth() + 1).toString().padStart(2, '0');
  const day = data.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Todos os signos para gerar
const signos = [
  { en: 'aries', pt: 'Áries' },
  { en: 'taurus', pt: 'Touro' },
  { en: 'gemini', pt: 'Gêmeos' },
  { en: 'cancer', pt: 'Câncer' },
  { en: 'leo', pt: 'Leão' },
  { en: 'virgo', pt: 'Virgem' },
  { en: 'libra', pt: 'Libra' },
  { en: 'scorpio', pt: 'Escorpião' },
  { en: 'sagittarius', pt: 'Sagitário' },
  { en: 'capricorn', pt: 'Capricórnio' },
  { en: 'aquarius', pt: 'Aquário' },
  { en: 'pisces', pt: 'Peixes' }
];

// Data para gerar horóscopo
const dataAtual = getDataBrasileira();
const dataChave = formatarDataChave(dataAtual);
const diaSemana = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' });

console.log('📅 Gerando horóscopo para:', dataChave);
console.log('📅 Dia da semana:', diaSemana);

// Configuração do contexto global para tracking
global.set('horoscopo_geracoes', {
  data: dataChave,
  iniciado: Date.now(),
  total: signos.length,
  concluidos: 0,
  erros: 0
});

// Preparar array de mensagens para processar cada signo
const mensagens = [];

for (let i = 0; i < signos.length; i++) {
  const signo = signos[i];
  
  console.log(`🔄 Preparando geração para ${signo.pt} (${signo.en})...`);
  
  // Criar mensagem para cada signo
  const msgSigno = {
    payload: {
      action: 'gerar_horoscopo',
      signo: signo.en,
      signo_nome: signo.pt,
      data: dataChave,
      dia_semana: diaSemana,
      timestamp: Date.now(),
      indice: i,
      total: signos.length
    },
    // Configurações para chamada à API da CatIA
    url: 'https://api.openai.com/v1/chat/completions', // ou sua API da CatIA
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_AQUI' // Substitua pelo token real
    },
    // Payload para a API da CatIA
    catia_request: {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é Cátia Fonseca, astróloga especialista em horóscopos diários. 
                   Crie um horóscopo personalizado, positivo e inspirador para ${signo.pt}.
                   Use linguagem acolhedora, dicas práticas e insights astrológicos.
                   Máximo 150 palavras. Tom: amigável, sábio, motivador.`
        },
        {
          role: "user", 
          content: `Crie o horóscopo de ${signo.pt} para hoje, ${dataChave} (${diaSemana}).
                   Inclua: energia do dia, dicas de amor, trabalho e bem-estar.
                   Seja específica mas positiva, usando elementos astrológicos relevantes.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    }
  };
  
  mensagens.push(msgSigno);
}

console.log(`✅ Preparadas ${mensagens.length} mensagens para geração`);
console.log('🚀 Enviando para processamento individual...');

// Retornar array de mensagens (Node-RED processará uma por vez)
return [mensagens];

// CONFIGURAÇÃO DO NODE-RED:
// 1. CRON node: "0 6 * * *" (06:00 diário)
// 2. Function node: Esta função (Gerar Horoscopo Diario)  
// 3. Split node: Para processar um signo por vez
// 4. HTTP Request node: Para chamar API da CatIA
// 5. Function node: Processar resposta e salvar no Firestore
// 6. Join node: Para aguardar todos os signos concluírem

// PRÓXIMOS NODES NECESSÁRIOS:
// → Split (dividir mensagens)
// → HTTP Request (chamar CatIA)
// → Function "Salvar Firestore" (processar resposta)
// → HTTP Request (salvar no Firestore)
// → Join (reagrupar resultados)
// → Function "Log Final" (log de conclusão) 