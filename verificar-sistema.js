#!/usr/bin/env node

import http from 'http';

console.log('🔍 Verificando sistema...\n');

// Função para testar uma URL
function testUrl(url, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: url.includes(':3001') ? 3001 : 5173,
      path: url.replace('http://localhost:3001', '').replace('http://localhost:5173', '') || '/',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${name}: OK (${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log(`❌ ${name}: FALHOU (${error.message})`);
      resolve(false);
    });

    req.setTimeout(2000, () => {
      console.log(`❌ ${name}: TIMEOUT`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Função para testar POST
function testPost(url, data, name) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url.replace('http://localhost:3001', ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${name}: OK (${res.statusCode})`);
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${name}: FALHOU (${error.message})`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${name}: TIMEOUT`);
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function verificarSistema() {
  console.log('1️⃣ Testando Frontend (Vite)...');
  await testUrl('http://localhost:5173', 'Frontend Vite');
  
  console.log('\n2️⃣ Testando Backend (Node.js)...');
  await testUrl('http://localhost:3001', 'Backend Express');
  
  console.log('\n3️⃣ Testando API Mercado Pago...');
  await testPost('http://localhost:3001/api/mercado-pago/create-preference', {
    items: [{
      title: 'Teste',
      unit_price: 10.00,
      quantity: 1
    }],
    payer: {
      email: 'teste@exemplo.com'
    }
  }, 'API Create Preference');
  
  console.log('\n🎯 Verificação concluída!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Acesse: http://localhost:5173');
  console.log('2. Faça login no app');
  console.log('3. Vá para Perfil → Comprar Créditos');
  console.log('4. Clique no botão laranja "🧪 TESTE NAVEGAÇÃO"');
  console.log('5. Verifique se redireciona para a página de checkout');
  console.log('\n🔧 Se houver problemas:');
  console.log('- Frontend: npm run dev (porta 5173)');
  console.log('- Backend: cd backend-exemplo && node server.js (porta 3001)');
}

verificarSistema().catch(console.error); 