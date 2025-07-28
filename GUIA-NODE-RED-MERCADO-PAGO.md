# 🚀 GUIA: MIGRAR MERCADO PAGO PARA NODE-RED

## 🎯 **OBJETIVO**
Migrar o backend do Mercado Pago de `localhost:3001` para o Node-RED na AWS, eliminando a dependência do servidor local.

## 📋 **PASSO A PASSO**

### **1️⃣ INSTALAR DEPENDÊNCIA NO NODE-RED**

```bash
# Conectar na AWS via SSH
ssh -i sua-chave.pem ubuntu@api.torrente.com.br

# Navegar para pasta do Node-RED
cd ~/.node-red

# Instalar SDK do Mercado Pago
npm install mercadopago

# Reiniciar Node-RED
sudo systemctl restart nodered
```

### **2️⃣ CONFIGURAR VARIÁVEL DE AMBIENTE**

1. **Acesse o Node-RED:** `https://api.torrente.com.br:1880`
2. **Vá em:** Menu (☰) > Settings > Environment Variables
3. **Adicione:**
   ```
   MERCADOPAGO_ACCESS_TOKEN = TEST-6756611187520583-072523-4c3229768706ed16219da6958c53f4c4-47637780
   ```

### **3️⃣ CRIAR FLOW NO NODE-RED**

#### **FLOW 1: CREATE PREFERENCE**

1. **HTTP IN node:**
   - Method: `POST`
   - URL: `/api/mercado-pago/create-preference`

2. **Function node (createPreference):**
   ```javascript
   const { MercadoPagoConfig, Preference } = require('mercadopago');
   
   const client = new MercadoPagoConfig({
       accessToken: env.get('MERCADOPAGO_ACCESS_TOKEN')
   });
   
   const preference = new Preference(client);
   
   const preferenceData = {
       items: msg.payload.items,
       payer: msg.payload.payer,
       metadata: msg.payload.metadata,
       notification_url: msg.payload.notification_url,
       back_urls: msg.payload.back_urls,
       auto_return: 'approved',
       statement_descriptor: 'UNIVERSO CATIA'
   };
   
   return preference.create({ body: preferenceData })
       .then(result => {
           msg.payload = {
               id: result.id,
               init_point: result.init_point,
               sandbox_init_point: result.sandbox_init_point
           };
           return msg;
       })
       .catch(error => {
           msg.statusCode = 500;
           msg.payload = {
               error: 'Erro interno do servidor',
               details: error.message
           };
           return msg;
       });
   ```

3. **HTTP RESPONSE node:**
   - Status Code: `200` (ou `msg.statusCode`)

#### **FLOW 2: PROCESS PAYMENT**

1. **HTTP IN node:**
   - Method: `POST`
   - URL: `/api/mercado-pago/process-payment`

2. **Function node (processPayment):**
   ```javascript
   const { MercadoPagoConfig, Payment } = require('mercadopago');
   
   const client = new MercadoPagoConfig({
       accessToken: env.get('MERCADOPAGO_ACCESS_TOKEN')
   });
   
   const payment = new Payment(client);
   
   const { selectedPaymentMethod, formData, userId, packageData } = msg.payload;
   
   const paymentData = {
       transaction_amount: parseFloat(packageData.price),
       token: formData.token || undefined,
       description: `${packageData.name} - ${packageData.credits} créditos`,
       installments: parseInt(formData.installments) || 1,
       payment_method_id: selectedPaymentMethod || formData.payment_method_id,
       issuer_id: formData.issuer_id || undefined,
       payer: {
           email: formData.payer?.email || formData.email,
           identification: formData.payer?.identification || formData.identification || undefined,
       },
       metadata: {
           user_id: userId,
           package_id: packageData.id,
           credits: packageData.credits
       }
   };
   
   if (paymentData.payment_method_id === 'pix') {
       paymentData.payment_method_id = 'pix';
       delete paymentData.token;
       delete paymentData.installments;
       delete paymentData.issuer_id;
   }
   
   return payment.create({ body: paymentData })
       .then(result => {
           msg.payload = {
               status: result.status,
               status_detail: result.status_detail,
               id: result.id,
               point_of_interaction: result.point_of_interaction
           };
           return msg;
       })
       .catch(error => {
           msg.statusCode = 500;
           msg.payload = {
               error: 'Erro interno do servidor',
               details: error.message
           };
           return msg;
       });
   ```

3. **HTTP RESPONSE node:**
   - Status Code: `200` (ou `msg.statusCode`)

#### **FLOW 3: WEBHOOK**

1. **HTTP IN node:**
   - Method: `POST`
   - URL: `/api/mercado-pago/webhook`

2. **Function node (webhookHandler):**
   ```javascript
   const { data, type } = msg.payload;
   
   if (type === 'payment') {
       const paymentId = data.id;
       
       // Log para debug
       node.log(`Webhook recebido: Payment ID ${paymentId}, Type: ${type}`);
       
       msg.payload = {
           received: true,
           payment_id: paymentId,
           type: type
       };
   }
   
   return msg;
   ```

3. **HTTP RESPONSE node:**
   - Status Code: `200`

### **4️⃣ ATUALIZAR FRONTEND**

#### **CheckoutPagamento.jsx:**
```javascript
// Alterar URL do backend
const createPreference = async () => {
  const response = await fetch('https://api.torrente.com.br/api/mercado-pago/create-preference', {
    // ... resto do código
  });
};

const handlePaymentSubmit = async (selectedPaymentMethod, formData, preferenceId) => {
  const response = await fetch('https://api.torrente.com.br/api/mercado-pago/process-payment', {
    // ... resto do código
  });
};
```

### **5️⃣ CONFIGURAR WEBHOOK NO MERCADO PAGO**

1. **Acesse:** Mercado Pago Developer Dashboard
2. **Vá em:** Webhooks
3. **Adicione:** `https://api.torrente.com.br/api/mercado-pago/webhook`
4. **Eventos:** `payment`

### **6️⃣ TESTAR**

```bash
# Testar create preference
curl -X POST https://api.torrente.com.br/api/mercado-pago/create-preference \
  -H "Content-Type: application/json" \
  -d '{"items":[{"title":"Teste","unit_price":10,"quantity":1}],"payer":{"email":"test@test.com"}}'

# Testar process payment
curl -X POST https://api.torrente.com.br/api/mercado-pago/process-payment \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

## ✅ **VANTAGENS DESTA ABORDAGEM**

- ✅ **Mesma infraestrutura** da API de horóscopo
- ✅ **SSL já configurado**
- ✅ **Sem custos adicionais**
- ✅ **Interface visual** para debug
- ✅ **Logs integrados**
- ✅ **Deploy instantâneo**

## 🎯 **RESULTADO FINAL**

- **URLs:** `https://api.torrente.com.br/api/mercado-pago/*`
- **Sem localhost:** Backend 100% na nuvem
- **24/7:** Sempre disponível
- **Escalável:** Mesma infraestrutura robusta

**Tempo estimado: 30 minutos** ⚡ 