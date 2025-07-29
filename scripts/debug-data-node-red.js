// Script para debug da data no Node-RED
// Simula o que o Node-RED está fazendo

console.log('🔍 DEBUG: Verificando data no Node-RED...');

// Função que o Node-RED usa
function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Testar diferentes cenários
console.log('📅 Data atual do sistema:', new Date().toString());
console.log('📅 Data UTC:', new Date().toUTCString());
console.log('📅 Data local:', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

console.log('\n🔍 Testando getDayKey():');
console.log('  - getDayKey():', getDayKey());
console.log('  - getDayKey(new Date()):', getDayKey(new Date()));

// Testar com data específica
const hoje = new Date();
console.log('  - getDayKey(hoje):', getDayKey(hoje));

// Verificar se há diferença de fuso horário
console.log('\n🌍 Informações de fuso horário:');
console.log('  - process.env.TZ:', process.env.TZ || 'não definido');
console.log('  - new Date().getTimezoneOffset():', new Date().getTimezoneOffset(), 'minutos');

// Testar URL que seria gerada
const diaAtual = getDayKey();
const urlCompleta = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaAtual}/signos/aries`;

console.log('\n🔗 URL que seria gerada:');
console.log('  ', urlCompleta);

// Testar se o documento existe
const https = require('https');

function testarURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testarURLs() {
  console.log('\n🧪 Testando URLs...');
  
  // Testar URL com data atual
  try {
    const resultado = await testarURL(urlCompleta);
    console.log('✅ URL atual:', resultado.status, resultado.data.error ? resultado.data.error.message : 'SUCESSO');
  } catch (error) {
    console.log('❌ Erro ao testar URL atual:', error.message);
  }
  
  // Testar URL com data de ontem (caso o Node-RED esteja com problema)
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const diaOntem = getDayKey(ontem);
  const urlOntem = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaOntem}/signos/aries`;
  
  try {
    const resultado = await testarURL(urlOntem);
    console.log('✅ URL ontem:', resultado.status, resultado.data.error ? resultado.data.error.message : 'SUCESSO');
  } catch (error) {
    console.log('❌ Erro ao testar URL ontem:', error.message);
  }
}

testarURLs(); 