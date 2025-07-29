# 🚀 Guia Completo - Cron Job de Horóscopos Semanais

Este guia explica como configurar e usar o sistema automático de geração de horóscopos semanais.

## 📋 Pré-requisitos

1. **Firebase configurado** com credenciais no arquivo `.env`
2. **OpenAI API Key** configurada
3. **Node.js** instalado
4. **Estrutura do Firebase** criada

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
# Firebase Configuration
FIREBASE_API_KEY=sua_api_key_real_aqui
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# OpenAI Configuration
OPENAI_API_KEY=sua_openai_api_key_aqui

# Node Environment
NODE_ENV=production
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Testar Conexão

```bash
npm run test
```

## 🚀 Comandos Disponíveis

### Geração Manual de Horóscopos

```bash
# Gerar horóscopos para todos os signos
npm run gerar

# Verificar status dos horóscopos
npm run gerar:status
```

### Cron Job

```bash
# Executar cron job manualmente
npm run cron

# Verificar status do cron job
npm run cron:status

# Testar cron job
npm run cron:teste

# Limpar logs antigos
npm run cron:limpar-logs
```

### Configuração Automática

```bash
# Configurar cron job automaticamente
npm run configurar-cron
```

## 📅 Configuração Manual do Cron

Se preferir configurar manualmente:

```bash
# Abrir editor de cron
crontab -e

# Adicionar linha (toda segunda-feira às 6h)
0 6 * * 1 cd /caminho/para/mistic-app/scripts && node cron-horoscopo.js executar
```

## 📊 Monitoramento

### Verificar Logs

```bash
# Ver logs do dia atual
tail -f logs/horoscopo-$(date +%Y-%m-%d).log

# Ver todos os logs
ls -la logs/

# Ver último log
tail -20 logs/horoscopo-$(date +%Y-%m-%d).log
```

### Verificar Status

```bash
# Status dos horóscopos
npm run gerar:status

# Status do cron job
npm run cron:status

# Ver cron jobs ativos
crontab -l
```

## 🔍 Troubleshooting

### Erro: "Variável de ambiente não configurada"

```bash
# Verificar arquivo .env
cat .env

# Verificar se as credenciais estão corretas
npm run test
```

### Erro: "OpenAI API Key inválida"

```bash
# Verificar OpenAI API Key
echo $OPENAI_API_KEY

# Testar conexão OpenAI
node -e "require('openai').OpenAI({apiKey: process.env.OPENAI_API_KEY})"
```

### Erro: "Firebase não conecta"

```bash
# Verificar regras do Firestore
# Aplicar regras temporárias se necessário

# Testar conexão Firebase
npm run test
```

### Cron Job não executa

```bash
# Verificar se o cron está ativo
crontab -l

# Verificar logs do sistema
sudo tail -f /var/log/syslog | grep CRON

# Testar manualmente
npm run cron
```

## 📈 Estrutura de Dados

### Firebase Firestore

```
horoscopos_semanais/
├── 2025-W04/                    # Semana atual
│   ├── config/                  # Configuração da semana
│   └── signos/
│       ├── aries/               # Horóscopo de Áries
│       ├── taurus/              # Horóscopo de Touro
│       └── ...
└── config/                      # Configuração geral
    ├── ultima_geracao: timestamp
    ├── proxima_geracao: timestamp
    ├── status: "ativo"
    └── semanas_ativas: [...]
```

### Logs

```
logs/
├── horoscopo-2025-01-27.log     # Log do dia
├── horoscopo-2025-01-28.log     # Log do dia
└── ...
```

## 🎯 Benefícios

### ⚡ Performance
- **Antes:** 2-5 segundos por usuário
- **Depois:** < 100ms por usuário

### 💰 Economia
- **Antes:** Muitas requisições OpenAI
- **Depois:** 12 requisições por semana

### 🔒 Confiabilidade
- Dados sempre disponíveis
- Sem dependência de APIs externas
- Cache inteligente

## 🔄 Manutenção

### Limpeza Automática
```bash
# Limpar logs antigos (mais de 30 dias)
npm run cron:limpar-logs
```

### Backup
```bash
# Exportar dados do Firestore
# Usar Firebase CLI ou console
```

### Atualização
```bash
# Atualizar dependências
npm update

# Verificar se tudo funciona
npm run test
npm run cron:teste
```

## 📞 Suporte

Para problemas ou dúvidas:

1. **Verificar logs:** `tail -f logs/horoscopo-$(date +%Y-%m-%d).log`
2. **Testar conexões:** `npm run test`
3. **Verificar status:** `npm run gerar:status`
4. **Executar manualmente:** `npm run cron`

## 🎉 Próximos Passos

1. **Configurar notificações** (email, Slack) para erros
2. **Implementar backup automático** dos dados
3. **Adicionar métricas** de uso e performance
4. **Criar dashboard** de monitoramento 