#!/bin/bash

# SCRIPT PARA CONFIGURAR CRON JOB DE LIMPEZA AUTOMÁTICA
# Execute este script para configurar a limpeza periódica

echo "🚀 CONFIGURANDO LIMPEZA AUTOMÁTICA DE CACHE..."

# Verificar se o script existe
SCRIPT_PATH="/home/ubuntu/new-universe-app/mistic-app/scripts/cron-limpeza-cache.js"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Script não encontrado em: $SCRIPT_PATH"
    echo "📁 Verifique se o arquivo existe e o caminho está correto"
    exit 1
fi

echo "✅ Script encontrado: $SCRIPT_PATH"

# Tornar o script executável
chmod +x "$SCRIPT_PATH"

# Criar entrada no crontab
# Limpeza a cada 6 horas (00:00, 06:00, 12:00, 18:00)
CRON_ENTRY="0 */6 * * * /usr/bin/node $SCRIPT_PATH >> /var/log/horoscopo-cron.log 2>&1"

echo "📅 Configurando cron job para execução a cada 6 horas..."
echo "⏰ Horários: 00:00, 06:00, 12:00, 18:00"

# Verificar se já existe a entrada
if crontab -l 2>/dev/null | grep -q "cron-limpeza-cache.js"; then
    echo "⚠️ Entrada já existe no crontab. Removendo entrada antiga..."
    crontab -l 2>/dev/null | grep -v "cron-limpeza-cache.js" | crontab -
fi

# Adicionar nova entrada
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

# Verificar se foi adicionado
if crontab -l 2>/dev/null | grep -q "cron-limpeza-cache.js"; then
    echo "✅ Cron job configurado com sucesso!"
    echo "📋 Entrada adicionada: $CRON_ENTRY"
else
    echo "❌ Erro ao configurar cron job"
    exit 1
fi

# Criar arquivo de log se não existir
sudo touch /var/log/horoscopo-cron.log
sudo chown ubuntu:ubuntu /var/log/horoscopo-cron.log

echo "📝 Arquivo de log criado: /var/log/horoscopo-cron.log"

# Testar o script
echo "🧪 Testando script de limpeza..."
node "$SCRIPT_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Script testado com sucesso!"
else
    echo "❌ Erro ao testar script"
    exit 1
fi

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "📋 RESUMO:"
echo "  - Script: $SCRIPT_PATH"
echo "  - Execução: A cada 6 horas"
echo "  - Log: /var/log/horoscopo-cron.log"
echo ""
echo "🔍 COMANDOS ÚTEIS:"
echo "  - Ver cron jobs: crontab -l"
echo "  - Ver logs: tail -f /var/log/horoscopo-cron.log"
echo "  - Executar manualmente: node $SCRIPT_PATH"
echo "  - Remover cron job: crontab -e (e deletar a linha)"
echo "" 