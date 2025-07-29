# 🚀 Configuração da Estrutura de Horóscopos no Firebase

Este diretório contém scripts para configurar e gerenciar horóscopos semanais no Firebase Firestore.

## 📋 Pré-requisitos

1. **Projeto Firebase configurado**
2. **Firestore habilitado**
3. **Node.js instalado**
4. **Credenciais do Firebase**

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
cd scripts
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp env-example.txt .env
```

Edite o arquivo `.env` com suas credenciais do Firebase:

```env
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
OPENAI_API_KEY=sua_openai_api_key_aqui
```

### 3. Testar Conexão

```bash
npm run test
```

### 4. Criar Estrutura Inicial

```bash
npm run setup:criar
```

## 📊 Estrutura de Dados

```
horoscopos_semanais/
├── 2024-W01/                    # Semana 1 de 2024
│   ├── aries/
│   │   ├── destaque: {...}
│   │   ├── segunda: {...}
│   │   ├── terca: {...}
│   │   ├── quarta: {...}
│   │   ├── quinta: {...}
│   │   ├── sexta: {...}
│   │   ├── sabado: {...}
│   │   └── domingo: {...}
│   ├── taurus/
│   │   └── ...
│   └── ...
├── 2024-W02/                    # Semana 2 de 2024
│   └── ...
└── config/
    ├── ultima_geracao: timestamp
    └── proxima_geracao: timestamp
```

## 🛠️ Comandos Disponíveis

### Setup e Configuração

```bash
# Criar estrutura inicial
npm run setup:criar

# Verificar estrutura existente
npm run setup:verificar

# Limpar dados de teste
npm run setup:limpar

# Testar conexão
npm run test
```

### Geração de Horóscopos

```bash
# Gerar horóscopos para todos os signos
npm run gerar
```

## 🔄 Cron Job Semanal

Para configurar a geração automática de horóscopos:

1. **Local (desenvolvimento):**
   ```bash
   npm run gerar
   ```

2. **Servidor (produção):**
   ```bash
   # Adicionar ao crontab
   0 6 * * 1 cd /path/to/scripts && npm run gerar
   ```

## 📱 Integração com Frontend

Após configurar a estrutura, o frontend pode buscar dados assim:

```javascript
// Buscar horóscopo da semana atual
const horoscopo = await db
  .collection('horoscopos_semanais')
  .doc('2024-W01')
  .collection('signos')
  .doc('aries')
  .get();
```

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o projeto Firebase existe
- Verifique as regras do Firestore

### Erro de Permissão
- Configure as regras do Firestore para permitir leitura/escrita
- Verifique se a API key tem as permissões necessárias

### Dados Não Encontrados
- Execute `npm run setup:criar` para criar a estrutura
- Verifique se a semana atual existe no banco

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Regras do Firestore](https://firebase.google.com/docs/firestore/security/get-started) 