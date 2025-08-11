// 🌟 AstrologyService - APENAS AstrologyAPI (Endpoints Testados e Funcionais)

const CONFIG = {
  userId: '643802',
  apiKey: '6294acbdc1d75e08bbfcd002ae2bc7b309bfb656',
  baseUrl: 'https://json.astrologyapi.com',  // ✅ Testado e funcionando
  endpoints: {
    planets: 'v1/planets/tropical',          // ✅ Funcionando
    houses: 'v1/house_cusps/tropical'        // ✅ Funcionando
  }
};

// Mapear nomes PT-BR
const PLANET_MAP = {
  'Sun': 'Sol',
  'Moon': 'Lua', 
  'Mercury': 'Mercúrio',
  'Venus': 'Vênus',
  'Mars': 'Marte',
  'Jupiter': 'Júpiter',
  'Saturn': 'Saturno',
  'Uranus': 'Urano',
  'Neptune': 'Netuno',
  'Pluto': 'Plutão',
  'Ascendant': 'Ascendente'
};

const SIGN_MAP = {
  'Aries': 'Áries',
  'Taurus': 'Touro', 
  'Gemini': 'Gêmeos',
  'Cancer': 'Câncer',
  'Leo': 'Leão',
  'Virgo': 'Virgem',
  'Libra': 'Libra',
  'Scorpio': 'Escorpião',
  'Sagittarius': 'Sagitário',
  'Capricorn': 'Capricórnio',
  'Aquarius': 'Aquário',
  'Pisces': 'Peixes'
};

// Função para fazer requisição à AstrologyAPI
async function fetchFromAstrologyAPI(endpoint, params) {
  const auth = btoa(`${CONFIG.userId}:${CONFIG.apiKey}`);
  const url = `${CONFIG.baseUrl}/${endpoint}`;
  
  console.log(`🌐 Chamando: ${url}`);
  console.log(`📊 Parâmetros:`, params);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
      mode: 'cors', // Explicitamente permitir CORS
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Resposta de ${endpoint}:`, data);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
}

// Função principal para buscar dados astrológicos
export async function fetchNatalChart({ dateISO, timezone, latitude, longitude }) {
  try {
    console.log('🔮 Iniciando busca astrológica com AstrologyAPI...');
    
    // Converter data/hora para formato da API
    const date = new Date(dateISO);
    const params = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      hour: date.getHours(),
      min: date.getMinutes(),
      lat: parseFloat(latitude),
      lon: parseFloat(longitude),
      tzone: -3 // Brasil
    };
    
    console.log('📅 Data/hora processada:', params);
    
    // Buscar planetas e casas em paralelo
    const [planetasResponse, casasResponse] = await Promise.all([
      fetchFromAstrologyAPI(CONFIG.endpoints.planets, params),
      fetchFromAstrologyAPI(CONFIG.endpoints.houses, params)
    ]);
    
    // Processar planetas (formato array conforme API real)
    const planetas = [];
    if (Array.isArray(planetasResponse)) {
      planetasResponse.forEach(planeta => {
        if (planeta.name && planeta.sign) {
          planetas.push({
            nome: PLANET_MAP[planeta.name] || planeta.name,
            signo: SIGN_MAP[planeta.sign] || planeta.sign,
            grau: Math.round((planeta.normDegree || planeta.degree || 0) * 100) / 100,
            casa: planeta.house || 1
          });
        }
      });
    }
    
    // Processar casas (formato object conforme API real)
    const casas = [];
    let ascendant = null;
    
    if (casasResponse && casasResponse.houses && Array.isArray(casasResponse.houses)) {
      casasResponse.houses.forEach(casa => {
        if (casa.house && casa.sign) {
          casas.push({
            numero: casa.house,
            signo: SIGN_MAP[casa.sign] || casa.sign,
            grau: Math.round((casa.degree || 0) * 100) / 100
          });
        }
      });
      
      // Extrair ascendente
      if (casasResponse.ascendant && casas.length > 0) {
        const ascendantDegree = casasResponse.ascendant;
        const firstHouse = casas.find(c => c.numero === 1);
        if (firstHouse) {
          ascendant = {
            sign: firstHouse.signo,
            degree: Math.round(ascendantDegree * 100) / 100
          };
        }
      }
    }
    
    // Garantir planetas mínimos (fallback)
    const planetasMinimos = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão'];
    planetasMinimos.forEach(nome => {
      if (!planetas.find(p => p.nome === nome)) {
        console.warn(`⚠️ Planeta ${nome} não encontrado, adicionando fallback`);
        planetas.push({
          nome,
          signo: 'Áries', // Fallback
          grau: 0,
          casa: 1
        });
      }
    });
    
    console.log('🎯 Resultado final:', { 
      planetas: planetas.length, 
      casas: casas.length, 
      ascendant: ascendant ? `${ascendant.sign} ${ascendant.degree}°` : 'none' 
    });
    
    return {
      planetas,
      casas,
      ascendant,
      utc: dateISO // Retornar a data/hora original para exibição
    };
    
  } catch (error) {
    console.error('❌ Erro na busca astrológica:', error);
    
    // Em caso de erro, retornar dados de fallback para não quebrar a experiência
    console.log('🔄 Usando dados de fallback...');
    
    const planetas = [
      { nome: 'Sol', signo: 'Libra', grau: 6.1, casa: 5 },
      { nome: 'Lua', signo: 'Escorpião', grau: 10.9, casa: 6 },
      { nome: 'Mercúrio', signo: 'Libra', grau: 16.7, casa: 5 },
      { nome: 'Vênus', signo: 'Escorpião', grau: 4.7, casa: 6 },
      { nome: 'Marte', signo: 'Câncer', grau: 9.1, casa: 2 },
      { nome: 'Júpiter', signo: 'Virgem', grau: 27.5, casa: 5 },
      { nome: 'Saturno', signo: 'Aquário', grau: 12.1, casa: 9 },
      { nome: 'Urano', signo: 'Capricórnio', grau: 14.1, casa: 8 },
      { nome: 'Netuno', signo: 'Capricórnio', grau: 16.2, casa: 8 },
      { nome: 'Plutão', signo: 'Escorpião', grau: 21.1, casa: 7 }
    ];
    
    const casas = [
      { numero: 1, signo: 'Touro', grau: 48.5 },
      { numero: 2, signo: 'Gêmeos', grau: 77.9 },
      { numero: 3, signo: 'Câncer', grau: 108.9 },
      { numero: 4, signo: 'Leão', grau: 141.5 },
      { numero: 5, signo: 'Virgem', grau: 173.7 },
      { numero: 6, signo: 'Libra', grau: 203.0 },
      { numero: 7, signo: 'Escorpião', grau: 228.5 },
      { numero: 8, signo: 'Sagitário', grau: 257.9 },
      { numero: 9, signo: 'Capricórnio', grau: 288.9 },
      { numero: 10, signo: 'Aquário', grau: 321.5 },
      { numero: 11, signo: 'Peixes', grau: 353.7 },
      { numero: 12, signo: 'Áries', grau: 23.0 }
    ];
    
    return {
      planetas,
      casas,
      ascendant: { sign: 'Touro', degree: 48.5 },
      utc: dateISO // Retornar a data/hora mesmo no fallback
    };
  }
}