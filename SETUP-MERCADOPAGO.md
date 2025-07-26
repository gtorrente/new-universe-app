# 🚀 Setup Mercado Pago - Universo Catia

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Conta no Mercado Pago com credenciais de produção
- Firebase configurado

## 🔑 Suas Credenciais

```bash
MERCADOPAGO_PUBLIC_KEY=APP_USR-308540b4-ad3b-4e6e-b167-31bf761ac177
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5236189943574221-031723-12016251c249e02b0836c2c14a624eec-47637780
```

## 🛠️ Configuração do Backend

### 1. Navegar para o diretório do backend
```bash
cd backend-exemplo
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Iniciar o servidor
```bash
npm start
# ou para desenvolvimento:
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

## 🔧 Configuração do Frontend

### 1. Criar arquivo .env na raiz do projeto mistic-app
```bash
# .env
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-308540b4-ad3b-4e6e-b167-31bf761ac177
VITE_API_URL=http://localhost:3001/api
```

### 2. Reiniciar o servidor de desenvolvimento
```bash
npm run dev
```

## 🌐 Configuração do Webhook no Mercado Pago

### 1. Acessar o painel do Mercado Pago
- Vá para: https://www.mercadopago.com.br/developers/
- Entre com sua conta

### 2. Configurar aplicação
- Acesse "Suas integrações"
- Selecione sua aplicação
- Vá em "Webhooks"

### 3. Adicionar URL do webhook
```
http://sua-url-publica.com/api/mercado-pago/webhook
```

**Para desenvolvimento local, use ngrok:**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3001
ngrok http 3001

# Use a URL gerada + /api/mercado-pago/webhook
```

## 🧪 Teste do Sistema

### 1. Iniciar ambos os servidores
```bash
# Terminal 1 - Backend
cd backend-exemplo
npm start

# Terminal 2 - Frontend  
cd ../
npm run dev
```

### 2. Testar fluxo completo
1. Acesse o app
2. Vá para "Perfil" → "Comprar Créditos"
3. Selecione um pacote
4. Clique em "Comprar"
5. Complete o pagamento

### 3. Cartões de teste (se estiver em sandbox)
```
Visa: 4013 5406 8274 6260
Mastercard: 5031 7557 3453 0604
CVV: 123
Vencimento: 11/25
```

## 🔒 Segurança

### Variáveis de ambiente
- ✅ Nunca commitar credenciais no Git
- ✅ Usar HTTPS em produção
- ✅ Validar webhooks do MP

### Firestore Rules
```javascript
// Proteger collection de transações
match /transactions/{transactionId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

## 📊 Monitoramento

### Logs importantes
```bash
# Backend logs
✅ Pagamento aprovado! Adicionar X créditos ao usuário Y
🔍 Webhook recebido: payment
❌ Erro ao processar pagamento

# Frontend logs  
✅ Payment Brick ready
🔍 Processando pagamento...
❌ Erro ao criar preference
```

## 🚨 Troubleshooting

### Erro: "Preference not found"
- Verificar se backend está rodando
- Verificar URLs no frontend

### Erro: "Invalid credentials"
- Verificar credenciais no backend
- Confirmar se são de produção/sandbox corretas

### Webhook não funciona
- Verificar URL pública
- Testar com ngrok para desenvolvimento
- Verificar logs do MP

### Créditos não são adicionados
- Verificar logs do webhook
- Confirmar se Firebase está configurado
- Verificar permissões do Firestore

## 📞 Suporte

Para ajuda adicional:
1. Verificar logs do backend/frontend
2. Testar endpoints individualmente
3. Consultar documentação do MP: https://www.mercadopago.com.br/developers/

## 🎯 Status de Implementação

- ✅ Frontend com Checkout Bricks
- ✅ Backend com APIs do MP  
- ✅ Webhook para confirmação
- ✅ Integração com Firebase
- ✅ Tratamento de erros
- ✅ Estados de pagamento
- ✅ Credenciais de produção

**Sistema pronto para uso em produção!** 🚀 