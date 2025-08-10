// Teste automatizado rápido do endpoint de astrologia
// Executar: node scripts/test-astrology-endpoint.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const baseUrl = process.env.ASTRO_API_URL || 'http://localhost:3001';
  const url = `${baseUrl.replace(/\/$/, '')}/api/astrology/natal`;
  const body = {
    dateISO: '1992-09-28T21:10:00',
    timezone: 'America/Sao_Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    houseSystem: 'placidus'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  console.log('Resposta:', JSON.stringify(json, null, 2));

  if (!json.ascendente || json.ascendente.signo !== 'Touro') {
    throw new Error('Ascendente esperado: Touro');
  }
  const sol = (json.planetas || []).find(p => p.nome.toLowerCase().includes('sol') || p.nome === 'Sun');
  if (!sol || sol.signo !== 'Libra') {
    throw new Error('Sol esperado em Libra');
  }
  console.log('✅ Teste passou: Sol em Libra e Ascendente em Touro');
}

run().catch((e) => {
  console.error('❌ Falhou:', e.message);
  process.exit(1);
});

