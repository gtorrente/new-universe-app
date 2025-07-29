#!/usr/bin/env node

// SCRIPT DE MONITORAMENTO AVANÇADO DO CACHE
// Execute para verificar status do cache e performance

const fs = require('fs');
const path = require('path');

// Configurações
const LOG_FILE = '/var/log/horoscopo-cache-monitor.log';
const ALERT_THRESHOLD = 100; // Alertar se mais de 100 itens no cache
const SIZE_THRESHOLD = 5 * 1024 * 1024; // Alertar se mais de 5MB

// Função para log
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Erro ao salvar log:', error.message);
  }
}

// Função para analisar cache do localStorage (simulação)
function analyzeLocalStorage() {
  log('🔍 Analisando cache do localStorage...');
  
  // Simular análise do localStorage
  const analysis = {
    totalItems: 0,
    expiredItems: 0,
    totalSize: 0,
    averageAge: 0,
    oldestItem: null,
    newestItem: null,
    itemsByType: {},
    recommendations: []
  };

  // Em um ambiente real, você precisaria acessar o localStorage do navegador
  // Aqui simulamos com dados de exemplo
  const mockData = [
    { key: 'horoscopo-aries-2025-W04', size: 2048, age: 3600000, type: 'semanal' },
    { key: 'horoscopo-taurus-2025-W04', size: 2048, age: 7200000, type: 'semanal' },
    { key: 'horoscopo-gemini-2025-W04', size: 1024, age: 1800000, type: 'diario' }
  ];

  mockData.forEach(item => {
    analysis.totalItems++;
    analysis.totalSize += item.size;
    
    if (item.age > 24 * 60 * 60 * 1000) { // 24 horas
      analysis.expiredItems++;
    }
    
    analysis.itemsByType[item.type] = (analysis.itemsByType[item.type] || 0) + 1;
  });

  analysis.averageAge = mockData.reduce((sum, item) => sum + item.age, 0) / mockData.length;

  // Recomendações
  if (analysis.totalItems > ALERT_THRESHOLD) {
    analysis.recommendations.push('Limpeza urgente necessária - muitos itens no cache');
  }
  
  if (analysis.totalSize > SIZE_THRESHOLD) {
    analysis.recommendations.push('Cache muito grande - considere limpeza');
  }
  
  if (analysis.expiredItems > analysis.totalItems * 0.5) {
    analysis.recommendations.push('Muitos itens expirados - limpeza recomendada');
  }

  return analysis;
}

// Função para verificar performance
function checkPerformance() {
  log('⚡ Verificando performance do sistema...');
  
  const performance = {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };

  const memoryUsageMB = Math.round(performance.memory.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(performance.memory.heapTotal / 1024 / 1024);
  
  log(`📊 Memória: ${memoryUsageMB}MB / ${memoryTotalMB}MB (${Math.round(memoryUsageMB/memoryTotalMB*100)}%)`);
  log(`⏰ Uptime: ${Math.round(performance.uptime / 3600)} horas`);
  
  // Alertas de performance
  if (memoryUsageMB > 500) {
    log('⚠️ ALERTA: Alto uso de memória', 'WARN');
  }
  
  if (performance.uptime > 168 * 3600) { // 7 dias
    log('⚠️ ALERTA: Sistema rodando há muito tempo', 'WARN');
  }

  return performance;
}

// Função para gerar relatório
function generateReport() {
  log('📋 Gerando relatório de monitoramento...');
  
  const report = {
    timestamp: new Date().toISOString(),
    cache: analyzeLocalStorage(),
    performance: checkPerformance(),
    recommendations: []
  };

  // Combinar recomendações
  report.recommendations = [
    ...report.cache.recommendations,
    ...(report.performance.memory.heapUsed > 500 * 1024 * 1024 ? ['Reiniciar aplicação para liberar memória'] : []),
    ...(report.performance.uptime > 168 * 3600 ? ['Considerar reinicialização do sistema'] : [])
  ];

  // Log do relatório
  log('📊 RELATÓRIO DE MONITORAMENTO:');
  log(`  - Itens no cache: ${report.cache.totalItems}`);
  log(`  - Itens expirados: ${report.cache.expiredItems}`);
  log(`  - Tamanho total: ${Math.round(report.cache.totalSize / 1024)}KB`);
  log(`  - Uso de memória: ${Math.round(report.performance.memory.heapUsed / 1024 / 1024)}MB`);
  log(`  - Uptime: ${Math.round(report.performance.uptime / 3600)} horas`);
  
  if (report.recommendations.length > 0) {
    log('💡 RECOMENDAÇÕES:');
    report.recommendations.forEach(rec => log(`  - ${rec}`));
  } else {
    log('✅ Sistema funcionando normalmente');
  }

  return report;
}

// Função para enviar alertas (exemplo)
function sendAlert(message, level = 'WARN') {
  log(`🚨 ALERTA: ${message}`, level);
  
  // Aqui você pode integrar com:
  // - Email
  // - Slack
  // - Telegram
  // - SMS
  // - Sistema de monitoramento
  
  console.log(`🚨 ALERTA [${level}]: ${message}`);
}

// Função principal
function main() {
  log('🚀 Iniciando monitoramento de cache...');
  
  try {
    const report = generateReport();
    
    // Verificar se há alertas
    if (report.recommendations.length > 0) {
      sendAlert(`Sistema precisa de atenção: ${report.recommendations.length} recomendações`);
    }
    
    log('✅ Monitoramento concluído com sucesso!');
    
  } catch (error) {
    log(`❌ Erro no monitoramento: ${error.message}`, 'ERROR');
    sendAlert(`Erro no monitoramento: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  analyzeLocalStorage,
  checkPerformance,
  generateReport,
  sendAlert
}; 