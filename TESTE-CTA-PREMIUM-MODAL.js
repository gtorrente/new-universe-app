// 🧪 SCRIPT DE TESTE - CTAs do PremiumBenefitsCarousel
// Execute no Console do DevTools para testar

console.log('🧪 INICIANDO TESTE DOS CTAs PREMIUM...');

// 1. Verificar se o carrossel está presente na página
const carousel = document.querySelector('[class*="gap-4"][class*="overflow-x-auto"]');
console.log('🎠 Carrossel encontrado:', !!carousel);

if (!carousel) {
  console.error('❌ Carrossel não encontrado na página');
} else {
  console.log('✅ Carrossel presente na página');
}

// 2. Verificar se há cards de benefícios
const benefitCards = document.querySelectorAll('[class*="w-72"][class*="h-96"]');
console.log(`📋 Cards de benefícios encontrados: ${benefitCards.length}`);

// 3. Verificar se há botões CTA
const ctaButtons = document.querySelectorAll('button[class*="bg-gradient-to-r"][class*="from-purple-500"]');
console.log(`🔘 Botões CTA encontrados: ${ctaButtons.length}`);

// 4. Função para simular click nos botões
function testarCTAs() {
  console.log('🧪 Testando clicks nos CTAs...');
  
  ctaButtons.forEach((button, index) => {
    console.log(`🔘 Testando botão ${index + 1}: "${button.textContent}"`);
    
    // Simular click
    button.click();
    
    // Verificar se modal apareceu
    setTimeout(() => {
      const modal = document.querySelector('[class*="fixed"][class*="inset-0"][class*="bg-black"]');
      if (modal) {
        console.log(`✅ Botão ${index + 1} funcionou - Modal apareceu!`);
        
        // Fechar modal para próximo teste
        const closeButton = modal.querySelector('button[class*="absolute"][class*="top-4"][class*="right-4"]');
        if (closeButton) {
          closeButton.click();
        }
      } else {
        console.log(`❌ Botão ${index + 1} falhou - Modal não apareceu`);
      }
    }, 500);
  });
}

// 5. Verificar logs esperados
console.log('📋 Logs esperados no console:');
console.log('- 🔔 Botão CTA clicado no card: [nome do benefício]');
console.log('- 📋 Detalhes do benefício: {objeto}');
console.log('- 🔗 Função onSubscribeClick disponível: true');
console.log('- ✅ Abrindo modal premium...');
console.log('- 🚀 Abrindo modal premium');

// 6. Executar teste automático
if (ctaButtons.length > 0) {
  console.log('🎯 EXECUTANDO TESTE AUTOMÁTICO...');
  setTimeout(testarCTAs, 1000);
} else {
  console.warn('⚠️ Nenhum botão CTA encontrado para testar');
}

// 7. Instruções para teste manual
console.log('📖 TESTE MANUAL:');
console.log('1. Role até o carrossel de benefícios premium');
console.log('2. Clique em qualquer card ou botão CTA');
console.log('3. Verifique se o modal premium abre');
console.log('4. Verifique os logs no console');

console.log('✅ SCRIPT DE TESTE CARREGADO!'); 