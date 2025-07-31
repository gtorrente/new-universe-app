#!/bin/bash

# 🔧 SCRIPT DE CORREÇÃO DO CRON - Horóscopo Diário
# Execute este script para corrigir problemas de path e logging

echo "🔧 CORRIGINDO CONFIGURAÇÃO DO CRON..."

# 1. Criar pasta de logs local
echo "📁 Criando pasta de logs..."
mkdir -p /Users/gustavotorrente/new-universe-app/mistic-app/scripts/logs

# 2. Backup do CRON atual
echo "💾 Fazendo backup do CRON atual..."
crontab -l > crontab_backup_$(date +%Y%m%d_%H%M%S).txt

# 3. Criar novo CRON corrigido
echo "⚙️ Criando nova configuração do CRON..."
cat > new_crontab.txt << 'EOF'
# Horóscopo Semanal - Toda segunda às 6h
0 6 * * 1 cd /Users/gustavotorrente/new-universe-app/mistic-app/scripts && /usr/local/bin/node cron-horoscopo.js executar >> ./logs/cron-horoscopo-semanal.log 2>&1

# Horóscopo Diário - Todos os dias às 6h
0 6 * * * cd /Users/gustavotorrente/new-universe-app/mistic-app/scripts && /usr/local/bin/node cron-horoscopo-diario.js executar >> ./logs/cron-horoscopo-diario.log 2>&1

# Verificação de Backup - Todos os dias às 6h15 (caso falhe às 6h)
15 6 * * * cd /Users/gustavotorrente/new-universe-app/mistic-app/scripts && /usr/local/bin/node cron-horoscopo-diario.js verificar-e-executar >> ./logs/cron-horoscopo-backup.log 2>&1

# Monitoramento - Todos os dias às 7h (verifica se foi gerado)
0 7 * * * cd /Users/gustavotorrente/new-universe-app/mistic-app/scripts && /usr/local/bin/node cron-horoscopo-diario.js status >> ./logs/cron-horoscopo-monitor.log 2>&1
EOF

# 4. Aplicar nova configuração
echo "📝 Aplicando nova configuração..."
crontab new_crontab.txt

# 5. Verificar se foi aplicado
echo "✅ Verificando configuração aplicada:"
echo "----------------------------------------"
crontab -l
echo "----------------------------------------"

# 6. Limpeza
rm new_crontab.txt

# 7. Teste de conectividade
echo "🧪 Testando configuração..."
echo "Path do Node: $(which node)"
echo "Status atual:"
/usr/local/bin/node cron-horoscopo-diario.js status

echo ""
echo "🎉 CORREÇÃO CONCLUÍDA!"
echo ""
echo "📋 O que foi alterado:"
echo "✅ Path absoluto do Node.js: /usr/local/bin/node"
echo "✅ Logs redirecionados para pasta local: ./logs/"
echo "✅ Backup de execução adicionado: 6h15"
echo "✅ Monitoramento diário adicionado: 7h"
echo ""
echo "📅 Próxima execução será amanhã às 6h"
echo "🔍 Para monitorar: tail -f logs/cron-horoscopo-diario.log" 