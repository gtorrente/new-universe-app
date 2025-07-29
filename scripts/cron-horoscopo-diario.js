#!/usr/bin/env node

// CRON JOB PARA HORÓSCOPO DIÁRIO
// Executar diariamente às 06:00 para gerar horóscopos do dia

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const LOG_FILE = '/var/log/horoscopo-diario-cron.log';
const SCRIPT_PATH = path.join(__dirname, 'gerar-horoscopo-diario.js');

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

// Função para executar geração de horóscopos diários
function executarGeracao() {
  return new Promise((resolve, reject) => {
    log('🚀 Iniciando geração de horóscopos diários...');
    
    const command = `node ${SCRIPT_PATH} gerar`;
    
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Erro na execução: ${error.message}`, 'ERROR');
        reject(error);
        return;
      }
      
      if (stderr) {
        log(`⚠️ Warnings: ${stderr}`, 'WARN');
      }
      
      log(`✅ Execução concluída:\n${stdout}`);
      resolve(stdout);
    });
  });
}

// Função para verificar status
function verificarStatus() {
  return new Promise((resolve, reject) => {
    log('📊 Verificando status dos horóscopos diários...');
    
    const command = `node ${SCRIPT_PATH} status`;
    
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Erro ao verificar status: ${error.message}`, 'ERROR');
        reject(error);
        return;
      }
      
      log(`📊 Status:\n${stdout}`);
      resolve(stdout);
    });
  });
}

// Função para limpar logs antigos
function limparLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 10) { // Se maior que 10MB
        log('🧹 Log muito grande, limpando...');
        
        // Manter apenas as últimas 1000 linhas
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const recentLines = lines.slice(-1000);
        
        fs.writeFileSync(LOG_FILE, recentLines.join('\n') + '\n');
        log('✅ Log limpo (mantidas últimas 1000 linhas)');
      }
    }
  } catch (error) {
    log(`❌ Erro ao limpar logs: ${error.message}`, 'ERROR');
  }
}

// Função para teste
function executarTeste() {
  return new Promise((resolve, reject) => {
    log('🧪 Executando teste de geração...');
    
    // Testar com apenas um signo
    const command = `node ${SCRIPT_PATH} signo aries`;
    
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Erro no teste: ${error.message}`, 'ERROR');
        reject(error);
        return;
      }
      
      log(`✅ Teste concluído:\n${stdout}`);
      resolve(stdout);
    });
  });
}

// Função principal
async function main() {
  try {
    log('🎯 CRON JOB DIÁRIO INICIADO');
    log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    log(`📁 Diretório: ${__dirname}`);
    
    // Verificar se o script existe
    if (!fs.existsSync(SCRIPT_PATH)) {
      throw new Error(`Script não encontrado: ${SCRIPT_PATH}`);
    }
    
    // Limpar logs antigos
    limparLogs();
    
    // Executar geração
    await executarGeracao();
    
    // Verificar status
    await verificarStatus();
    
    log('🎉 CRON JOB DIÁRIO CONCLUÍDO COM SUCESSO');
    
  } catch (error) {
    log(`❌ ERRO CRÍTICO NO CRON JOB: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'executar':
    main();
    break;
    
  case 'status':
    verificarStatus();
    break;
    
  case 'teste':
    executarTeste();
    break;
    
  case 'limpar-logs':
    limparLogs();
    console.log('✅ Logs limpos!');
    break;
    
  default:
    console.log('📋 COMANDOS DISPONÍVEIS:');
    console.log('  npm run diario:cron:executar  - Executar geração diária');
    console.log('  npm run diario:cron:status   - Verificar status');
    console.log('  npm run diario:cron:teste    - Executar teste');
    console.log('  npm run diario:cron:limpar   - Limpar logs');
    console.log('');
    console.log('📝 EXEMPLOS:');
    console.log('  npm run diario:cron:executar');
    console.log('  npm run diario:cron:status');
    console.log('  npm run diario:cron:teste');
    break;
} 