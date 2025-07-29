// Teste da correção de fuso horário

console.log('🧪 TESTANDO CORREÇÃO DE FUSO HORÁRIO...');

// Função original (problemática)
function getDayKeyOriginal(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função corrigida (com fuso horário brasileiro)
function getDayKeyCorrigido(date = new Date()) {
  // Forçar fuso horário brasileiro
  const dataBR = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const year = dataBR.getFullYear();
  const month = (dataBR.getMonth() + 1).toString().padStart(2, '0');
  const day = dataBR.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

console.log('📅 Data atual do sistema:', new Date().toString());
console.log('📅 Data UTC:', new Date().toUTCString());
console.log('📅 Data BR:', new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));

console.log('\n🔍 Comparando funções:');
console.log('  - getDayKeyOriginal():', getDayKeyOriginal());
console.log('  - getDayKeyCorrigido():', getDayKeyCorrigido());

// Testar URLs
const diaOriginal = getDayKeyOriginal();
const diaCorrigido = getDayKeyCorrigido();

const urlOriginal = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaOriginal}/signos/aries`;
const urlCorrigido = `https://firestore.googleapis.com/v1/projects/tarot-universo-catia/databases/(default)/documents/horoscopos_diarios/${diaCorrigido}/signos/aries`;

console.log('\n🔗 URLs geradas:');
console.log('  Original:', urlOriginal);
console.log('  Corrigido:', urlCorrigido);

// Testar se as URLs funcionam
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
  
  // Testar URL original
  try {
    const resultado = await testarURL(urlOriginal);
    console.log('✅ URL Original:', resultado.status, resultado.data.error ? resultado.data.error.message : 'SUCESSO');
  } catch (error) {
    console.log('❌ Erro URL Original:', error.message);
  }
  
  // Testar URL corrigida
  try {
    const resultado = await testarURL(urlCorrigido);
    console.log('✅ URL Corrigido:', resultado.status, resultado.data.error ? resultado.data.error.message : 'SUCESSO');
  } catch (error) {
    console.log('❌ Erro URL Corrigido:', error.message);
  }
}

testarURLs(); 