#!/usr/bin/env node

require('dotenv').config();
const { gerarTodosHoroscopos, verificarStatus } = require('./gerar-horoscopos-semanais');
const fs = require('fs');
const path = require('path');

// Configuração de logs
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, `horoscopo-${new Date().toISOString().split('T')[0]}.log`);

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Função para escrever log
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

// Função principal do cron
async function executarCron() {
  try {
    writeLog('🚀 Iniciando execução do cron job de horóscopos...');
    writeLog(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
    writeLog(`📁 Log file: ${logFile}`);
    
    // Verificar se as variáveis de ambiente estão configuradas
    const requiredEnvVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID', 
      'OPENAI_API_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar] || process.env[envVar].includes('your_')) {
        throw new Error(`❌ Variável de ambiente ${envVar} não configurada corretamente`);
      }
    }
    
    writeLog('✅ Variáveis de ambiente verificadas');
    
    // Verificar status atual
    writeLog('🔍 Verificando status atual...');
    await verificarStatus();
    
    // Gerar horóscopos
    writeLog('🔮 Iniciando geração de horóscopos...');
    await gerarTodosHoroscopos();
    
    writeLog('✅ Cron job executado com sucesso!');
    
  } catch (error) {
    writeLog(`❌ Erro na execução do cron job: ${error.message}`);
    writeLog(`📋 Stack trace: ${error.stack}`);
    
    // Enviar notificação de erro (opcional)
    // Aqui você pode adicionar notificação por email, Slack, etc.
    
    process.exit(1);
  }
}

// Função para limpar logs antigos
function limparLogsAntigos() {
  try {
    const logs = fs.readdirSync(logDir);
    const hoje = new Date();
    
    logs.forEach(log => {
      const logPath = path.join(logDir, log);
      const stats = fs.statSync(logPath);
      const diasAntigo = (hoje - stats.mtime) / (1000 * 60 * 60 * 24);
      
      // Remover logs com mais de 30 dias
      if (diasAntigo > 30) {
        fs.unlinkSync(logPath);
        console.log(`🗑️ Log removido: ${log}`);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error);
  }
}

// Executar baseado no comando
if (require.main === module) {
  const comando = process.argv[2];
  
  switch (comando) {
    case 'executar':
      executarCron();
      break;
    case 'status':
      verificarStatus();
      break;
    case 'limpar-logs':
      limparLogsAntigos();
      break;
    case 'teste':
      writeLog('🧪 Teste do cron job');
      writeLog('✅ Teste concluído com sucesso');
      break;
    default:
      console.log('📋 Comandos disponíveis:');
      console.log('  node cron-horoscopo.js executar    - Executar cron job');
      console.log('  node cron-horoscopo.js status      - Verificar status');
      console.log('  node cron-horoscopo.js limpar-logs  - Limpar logs antigos');
      console.log('  node cron-horoscopo.js teste        - Teste do cron job');
      console.log('');
      console.log('📅 Para configurar cron job semanal:');
      console.log('  0 6 * * 1 cd /path/to/scripts && node cron-horoscopo.js executar');
  }
}

module.exports = { executarCron, limparLogsAntigos }; 