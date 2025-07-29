#!/bin/bash

# Script para configurar cron job semanal de horóscopos
# Executar como: bash configurar-cron.sh

echo "🚀 Configurando cron job para horóscopos semanais..."

# Obter o diretório atual
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Diretório dos scripts: $SCRIPT_DIR"

# Verificar se o arquivo .env existe
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ Arquivo .env não encontrado em $SCRIPT_DIR"
    echo "💡 Execute primeiro: cp env-example.txt .env"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "📦 Instalando dependências..."
    cd "$SCRIPT_DIR"
    npm install
fi

# Tornar o script executável
chmod +x "$SCRIPT_DIR/cron-horoscopo.js"

# Comando do cron (toda segunda-feira às 6h)
CRON_COMMAND="0 6 * * 1 cd $SCRIPT_DIR && node cron-horoscopo.js executar"

echo "📅 Comando do cron: $CRON_COMMAND"

# Verificar se já existe um cron job similar
EXISTING_CRON=$(crontab -l 2>/dev/null | grep "cron-horoscopo.js")

if [ -n "$EXISTING_CRON" ]; then
    echo "⚠️  Cron job já existe:"
    echo "   $EXISTING_CRON"
    echo ""
    read -p "Deseja substituir? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remover cron job existente
        crontab -l 2>/dev/null | grep -v "cron-horoscopo.js" | crontab -
        echo "🗑️ Cron job anterior removido"
    else
        echo "❌ Operação cancelada"
        exit 0
    fi
fi

# Adicionar novo cron job
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job configurado com sucesso!"
    echo ""
    echo "📋 Cronograma:"
    echo "   - Execução: Toda segunda-feira às 6h"
    echo "   - Script: $SCRIPT_DIR/cron-horoscopo.js"
    echo "   - Logs: $SCRIPT_DIR/logs/"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "   - Ver cron jobs: crontab -l"
    echo "   - Editar cron jobs: crontab -e"
    echo "   - Remover cron job: crontab -r"
    echo "   - Testar manualmente: node cron-horoscopo.js executar"
    echo "   - Verificar status: node cron-horoscopo.js status"
    echo ""
    echo "📊 Para verificar se está funcionando:"
    echo "   tail -f $SCRIPT_DIR/logs/horoscopo-$(date +%Y-%m-%d).log"
else
    echo "❌ Erro ao configurar cron job"
    exit 1
fi 