#!/usr/bin/env node

// SCRIPT DE LIMPEZA AUTOMÁTICA NO SERVIDOR
// Executar via cron para limpeza periódica

const fs = require('fs');
const path = require('path');

// Configurações
const LOG_FILE = '/var/log/horoscopo-cache-cleanup.log';
const CACHE_DIR = '/tmp/horoscopo-cache'; // Se existir
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

// Função para log
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Salvar no arquivo de log
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Erro ao salvar log:', error.message);
  }
}

// Função para limpar logs antigos
function cleanupLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE);
      if (stats.size > MAX_LOG_SIZE) {
        // Manter apenas as últimas 1000 linhas
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const recentLines = lines.slice(-1000);
        fs.writeFileSync(LOG_FILE, recentLines.join('\n') + '\n');
        log('Logs antigos removidos (mantidas últimas 1000 linhas)');
      }
    }
  } catch (error) {
    console.error('Erro ao limpar logs:', error.message);
  }
}

// Função para limpar cache do sistema
function cleanupSystemCache() {
  log('🧹 Iniciando limpeza de cache do sistema...');
  
  let cleanedItems = 0;
  
  // 1. Limpar cache do Node-RED (se existir)
  const nodeRedCacheDir = '/tmp/.node-red';
  if (fs.existsSync(nodeRedCacheDir)) {
    try {
      const files = fs.readdirSync(nodeRedCacheDir);
      files.forEach(file => {
        if (file.includes('cache') || file.includes('temp')) {
          const filePath = path.join(nodeRedCacheDir, file);
          fs.unlinkSync(filePath);
          cleanedItems++;
        }
      });
      log(`✅ Cache do Node-RED limpo: ${cleanedItems} arquivos removidos`);
    } catch (error) {
      log(`❌ Erro ao limpar cache do Node-RED: ${error.message}`);
    }
  }
  
  // 2. Limpar cache do Nginx (se configurado)
  const nginxCacheDir = '/var/cache/nginx';
  if (fs.existsSync(nginxCacheDir)) {
    try {
      // Limpar apenas cache antigo (mais de 1 hora)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const files = fs.readdirSync(nginxCacheDir);
      
      files.forEach(file => {
        const filePath = path.join(nginxCacheDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.mtime.getTime() < oneHourAgo) {
            fs.unlinkSync(filePath);
            cleanedItems++;
          }
        } catch (error) {
          // Ignorar erros de arquivos individuais
        }
      });
      
      log(`✅ Cache do Nginx limpo: ${cleanedItems} arquivos antigos removidos`);
    } catch (error) {
      log(`❌ Erro ao limpar cache do Nginx: ${error.message}`);
    }
  }
  
  // 3. Limpar logs do sistema
  cleanupLogs();
  
  log(`🎉 Limpeza concluída: ${cleanedItems} itens removidos`);
  return cleanedItems;
}

// Função para verificar saúde do sistema
function checkSystemHealth() {
  log('🏥 Verificando saúde do sistema...');
  
  const health = {
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform
  };
  
  // Verificar uso de memória
  const memoryUsageMB = Math.round(health.memory.heapUsed / 1024 / 1024);
  log(`📊 Uso de memória: ${memoryUsageMB}MB`);
  
  // Verificar uptime
  const uptimeHours = Math.round(health.uptime / 3600);
  log(`⏰ Uptime: ${uptimeHours} horas`);
  
  // Alertas
  if (memoryUsageMB > 500) {
    log(`⚠️ ALERTA: Alto uso de memória (${memoryUsageMB}MB)`);
  }
  
  if (uptimeHours > 168) { // 7 dias
    log(`⚠️ ALERTA: Sistema rodando há mais de 7 dias (${uptimeHours} horas)`);
  }
  
  return health;
}

// Função principal
function main() {
  log('🚀 Iniciando script de limpeza automática...');
  
  try {
    // Verificar saúde do sistema
    const health = checkSystemHealth();
    
    // Limpar cache
    const cleanedItems = cleanupSystemCache();
    
    // Log final
    log(`✅ Script concluído com sucesso!`);
    log(`📊 Resumo: ${cleanedItems} itens limpos`);
    
  } catch (error) {
    log(`❌ Erro crítico no script: ${error.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  cleanupSystemCache,
  checkSystemHealth,
  cleanupLogs
}; 