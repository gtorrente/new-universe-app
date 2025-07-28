# 🔧 FIX: ERRO "require is not defined" NO NODE-RED

## 🚨 **PROBLEMA IDENTIFICADO**
O Node-RED não permite usar `require()` diretamente nos Function nodes.

## 🎯 **SOLUÇÃO 1: MÓDULO GLOBAL (RECOMENDADO)**

### **1️⃣ INSTALAR MÓDULO GLOBAL**

```bash
# SSH na AWS
ssh -i sua-chave.pem ubuntu@api.torrente.com.br

# Navegar para pasta do Node-RED
cd ~/.node-red

# Instalar mercadopago globalmente
npm install mercadopago

# Reiniciar Node-RED
sudo systemctl restart nodered
```

### **2️⃣ CONFIGURAR MÓDULO NO NODE-RED**

1. **Acesse:** `http://api.torrente.com.br:1880`
2. **Vá em:** Menu (☰) > Settings > Function global context
3. **Adicione:**
```javascript
// Function Global Context
module.exports = function(globalContext) {
    globalContext.set('mercadopago', require('mercadopago'));
    globalContext.set('MercadoPagoConfig', require('mercadopago').MercadoPagoConfig);
    globalContext.set('Preference', require('mercadopago').Preference);
    globalContext.set('Payment', require('mercadopago').Payment);
}
```

### **3️⃣ ATUALIZAR CÓDIGO DOS FUNCTION NODES**

#### **CREATE PREFERENCE:**
```javascript
// Usar módulos globais
const client = new global.get('MercadoPagoConfig')({
    accessToken: env.get('MERCADOPAGO_ACCESS_TOKEN')
});

const preference = new global.get('Preference')(client);

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

#### **PROCESS PAYMENT:**
```javascript
const client = new global.get('MercadoPagoConfig')({
    accessToken: env.get('MERCADOPAGO_ACCESS_TOKEN')
});

const payment = new global.get('Payment')(client);

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

## 🎯 **SOLUÇÃO 2: HTTP REQUEST NODES (ALTERNATIVA)**

Se a Solução 1 não funcionar, use HTTP Request nodes:

### **CREATE PREFERENCE:**
1. **HTTP REQUEST node:**
   - Method: `POST`
   - URL: `https://api.mercadopago.com/checkout/preferences`
   - Headers: `Authorization: Bearer TEST-6756611187520583-072523-4c3229768706ed16219da6958c53f4c4-47637780`
   - Body: `msg.payload` (JSON)

### **PROCESS PAYMENT:**
1. **HTTP REQUEST node:**
   - Method: `POST`
   - URL: `https://api.mercadopago.com/v1/payments`
   - Headers: `Authorization: Bearer TEST-6756611187520583-072523-4c3229768706ed16219da6958c53f4c4-47637780`
   - Body: `msg.payload` (JSON)

## 🚀 **PASSO A PASSO RÁPIDO**

### **1️⃣ Instalar módulo:**
```bash
ssh -i sua-chave.pem ubuntu@api.torrente.com.br
cd ~/.node-red
npm install mercadopago
sudo systemctl restart nodered
```

### **2️⃣ Configurar global context:**
- Node-RED > Settings > Function global context
- Adicionar código fornecido

### **3️⃣ Atualizar Function nodes:**
- Substituir `require('mercadopago')` por `global.get('MercadoPagoConfig')`
- Deploy os flows

### **4️⃣ Testar:**
```bash
curl -X POST https://api.torrente.com.br/api/mercado-pago/create-preference \
  -H "Content-Type: application/json" \
  -d '{"items":[{"title":"Teste","unit_price":10,"quantity":1}],"payer":{"email":"test@test.com"}}'
```

## ✅ **RESULTADO ESPERADO**

- ✅ Sem erros de `require`
- ✅ Endpoints funcionando
- ✅ Mercado Pago integrado
- ✅ Logs limpos no debug

**Execute a Solução 1 primeiro e me informe o resultado!** 🔧 