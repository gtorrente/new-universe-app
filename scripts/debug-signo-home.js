// Script para debugar problema do signo na Home.jsx

// Simular as funções de signo da Home.jsx
function getSign(day, month) {
  const signs = [
    { sign: "Aquário", start: [1, 20], en: "aquarius" },
    { sign: "Peixes", start: [2, 19], en: "pisces" },
    { sign: "Áries", start: [3, 21], en: "aries" },
    { sign: "Touro", start: [4, 20], en: "taurus" },
    { sign: "Gêmeos", start: [5, 21], en: "gemini" },
    { sign: "Câncer", start: [6, 21], en: "cancer" },
    { sign: "Leão", start: [7, 23], en: "leo" },
    { sign: "Virgem", start: [8, 23], en: "virgo" },
    { sign: "Libra", start: [9, 23], en: "libra" },
    { sign: "Escorpião", start: [10, 23], en: "scorpio" },
    { sign: "Sagitário", start: [11, 22], en: "sagittarius" },
    { sign: "Capricórnio", start: [12, 22], en: "capricorn" },
  ];
  const date = new Date(2020, month - 1, day);
  for (let i = signs.length - 1; i >= 0; i--) {
    const [m, d] = signs[i].start;
    const startDate = new Date(2020, m - 1, d);
    if (date >= startDate) return signs[i];
  }
  return signs[signs.length - 1];
}

function getSignMapping() {
  return [
    { sign: "Aquário", en: "aquarius" },
    { sign: "Peixes", en: "pisces" },
    { sign: "Áries", en: "aries" },
    { sign: "Touro", en: "taurus" },
    { sign: "Gêmeos", en: "gemini" },
    { sign: "Câncer", en: "cancer" },
    { sign: "Leão", en: "leo" },
    { sign: "Virgem", en: "virgo" },
    { sign: "Libra", en: "libra" },
    { sign: "Escorpião", en: "scorpio" },
    { sign: "Sagitário", en: "sagittarius" },
    { sign: "Capricórnio", en: "capricorn" },
  ];
}

console.log('🔍 DEBUG: INVESTIGANDO PROBLEMA DO SIGNO NA HOME\n');

// Simular diferentes cenários
const cenarios = [
  { 
    desc: 'Usuário com data nascimento salva e signo salvo',
    userData: {
      dataNascimento: '1990-07-28',
      sign: 'leo'
    }
  },
  { 
    desc: 'Usuário com data nascimento mas sem signo salvo',
    userData: {
      dataNascimento: '1990-07-28'
    }
  },
  { 
    desc: 'Usuário sem data de nascimento',
    userData: {}
  }
];

cenarios.forEach((cenario, index) => {
  console.log(`=== CENÁRIO ${index + 1}: ${cenario.desc} ===`);
  
  const { userData } = cenario;
  let signo = '';
  let signoEn = '';
  let mostrarModal = false;
  
  console.log('📥 Dados do usuário:', userData);
  
  const dataNasc = userData.dataNascimento;
  const signSalvo = userData.sign;
  
  if (dataNasc) {
    console.log('✅ Usuário tem data de nascimento:', dataNasc);
    
    // Se já tem signo salvo, usa ele
    if (signSalvo) {
      console.log('✅ Signo já salvo no Firebase:', signSalvo);
      signoEn = signSalvo;
      
      // Converte de inglês para português para exibição
      const signObj = getSignMapping().find(s => s.en === signSalvo);
      signo = signObj ? signObj.sign : "";
      
      console.log('🔄 Conversão EN->PT:', { signSalvo, signObj, signoFinal: signo });
      
    } else {
      console.log('❓ Signo não salvo, calculando...');
      
      // Se não tem signo salvo, calcula e salva
      const [, mes, dia] = dataNasc.split('-').map(Number);
      console.log('📅 Data parseada:', { dia, mes });
      
      const signObj = getSign(dia, mes);
      console.log('🎯 Signo calculado:', signObj);
      
      signo = signObj.sign;
      signoEn = signObj.en;
      
      console.log('💾 Signo seria salvo no Firebase:', signObj.en);
    }
  } else {
    console.log('❌ Usuário SEM data de nascimento');
    mostrarModal = true;
  }
  
  console.log('📊 RESULTADO FINAL:');
  console.log('  - signo (PT):', signo || 'VAZIO');
  console.log('  - signoEn:', signoEn || 'VAZIO');
  console.log('  - mostrarModal:', mostrarModal);
  console.log('  - HoroscopeCard vai receber:', signo || "Seu signo");
  console.log('');
});

console.log('🧪 TESTE DE CACHE:');
console.log('Verificando se pode haver problema de cache...\n');

// Simular localStorage
console.log('💾 Chaves que podem estar no localStorage:');
const possiveisChaves = [
  'horoscopo-diario-leo-2025-07-29',
  'horoscopo-diario-libra-2025-07-29', 
  'userData',
  'user-cache',
  'sign-cache'
];

possiveisChaves.forEach(chave => {
  console.log(`  - ${chave}`);
});

console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
console.log('1. Limpar localStorage do navegador');
console.log('2. Verificar se getSignMapping() está sendo chamada corretamente');
console.log('3. Adicionar logs no console do navegador para debug');
console.log('4. Verificar se há erro na conversão EN->PT');
console.log('5. Verificar estado do Firebase Auth');

console.log('\n⚠️ PONTOS DE ATENÇÃO:');
console.log('• A função getSignMapping() precisa retornar o array correto');
console.log('• O signo em inglês deve bater com o array de conversão');
console.log('• O estado signo deve ser atualizado corretamente');
console.log('• Verificar se não há erro assíncrono no useEffect'); 