require('dotenv').config();
const OpenAI = require('openai');

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Função para obter nome do dia da semana
function getDayName(date = new Date()) {
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return dias[date.getDay()];
}

// Função para gerar horóscopo diário de um signo
async function gerarHoroscopoDiario(signo, nomeSigno) {
  try {
    const hoje = new Date();
    const diaSemana = getDayName(hoje);
    
    console.log(`🔮 Gerando horóscopo diário para ${nomeSigno} (${diaSemana})...`);
    
    const prompt = `Você é um astrologo que vai fazer a previsão do dia de hoje (${diaSemana}) para o signo ${nomeSigno}, e usar o mesmo tom de voz da apresentadora Catia Fonseca, vai finalizar a frase com um emoji e usar até 220 caracteres.

REQUISITOS:
- Tom de voz da Catia Fonseca (carismática, calorosa, próxima)
- Linguagem acessível e motivacional
- Foco no dia de hoje (${diaSemana})
- Máximo 220 caracteres
- Finalizar com emoji
- Sem previsões negativas

EXEMPLO DE TOM:
"Oi, ${nomeSigno}! Hoje é um dia especial para você. As energias estão alinhadas e você vai se surpreender com as oportunidades que aparecem no seu caminho. Confie na sua intuição! ✨"

IMPORTANTE: Retorne APENAS o texto da previsão, sem aspas ou formatação adicional.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é a apresentadora Catia Fonseca, especialista em astrologia. Use um tom carismático, caloroso e próximo. Sempre seja positiva e motivacional."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    let horoscopoTexto = response.choices[0].message.content.trim();
    
    // Verificar se tem emoji
    if (!/\p{Emoji}/u.test(horoscopoTexto)) {
      console.warn(`⚠️ Horóscopo para ${nomeSigno} não tem emoji, adicionando...`);
      horoscopoTexto += ' ✨';
    }

    // Verificar tamanho
    if (horoscopoTexto.length > 220) {
      console.warn(`⚠️ Horóscopo para ${nomeSigno} muito longo (${horoscopoTexto.length} chars), truncando...`);
      horoscopoTexto = horoscopoTexto.substring(0, 217) + '...';
    }

    console.log(`✅ Horóscopo diário gerado para ${nomeSigno}: "${horoscopoTexto}"`);
    console.log(`📊 Tamanho: ${horoscopoTexto.length} caracteres`);
    console.log('');

    return horoscopoTexto;

  } catch (error) {
    console.error(`❌ Erro ao gerar horóscopo diário para ${nomeSigno}:`, error);
    throw error;
  }
}

// Testar com um signo
async function testar() {
  try {
    console.log('🧪 TESTE DE GERAÇÃO DE HORÓSCOPO DIÁRIO');
    console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
    console.log('');
    
    await gerarHoroscopoDiario('aries', 'Áries');
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testar(); 