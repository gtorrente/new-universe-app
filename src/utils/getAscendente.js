// calcularAscendenteAPI.js

// Substitua pela sua chave de API
const API_KEY = 'vytbhkPd609U4vWDbgRcB7ZY8ecEdns07FXGDZNm';

async function calcularAscendente({ 
  data,      // formato: 'YYYY-MM-DD'
  hora,      // formato: 'HH:mm'
  latitude,  // ex: -23.5505
  longitude, // ex: -46.6333
  timezone   // ex: '-3' para Brasília
}) {
  // Monta a data/hora no formato esperado
  const [ano, mes, dia] = data.split('-');
  const [horaStr, minStr] = hora.split(':');
  const url = 'https://json.freeastrologyapi.com/western/natal-wheel-chart';

  const body = {
    day: parseInt(dia, 10),
    month: parseInt(mes, 10),
    year: parseInt(ano, 10),
    hour: parseInt(horaStr, 10),
    min: parseInt(minStr, 10),
    lat: parseFloat(latitude),
    lon: parseFloat(longitude),
    tzone: parseFloat(timezone)
  };

  console.log('[Ascendente] Corpo enviado para API:', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Ascendente] Erro na API:', response.status, errorText);
    throw new Error(`Erro na API: ${response.status} - ${errorText}`);
  }

  const dataJson = await response.json();
  console.log('[Ascendente] Resposta completa da API:', dataJson);

  // O ascendente geralmente está em dataJson.ascendant ou dataJson.houses[0]
  const ascendente = dataJson.ascendant || (dataJson.houses && dataJson.houses[0]);
  console.log('[Ascendente] Campo retornado para ascendente:', ascendente);
  return ascendente;
}

// Exemplo de uso:
(async () => {
  try {
    const resultado = await calcularAscendente({
      data: '1992-09-28',
      hora: '08:30',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: -3
    });
    console.log('Ascendente:', resultado);
  } catch (e) {
    console.error(e);
  }
})();

export default calcularAscendente;