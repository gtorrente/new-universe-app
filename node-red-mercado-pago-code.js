// CÓDIGO PARA NODE-RED - MERCADO PAGO
// Adicione este código em um node "function" no Node-RED

// 1. INSTALAR DEPENDÊNCIA NO NODE-RED:
// No terminal da AWS, execute:
// cd ~/.node-red
// npm install mercadopago

// 2. CONFIGURAR VARIÁVEL DE AMBIENTE:
// No Node-RED, vá em Settings > Environment Variables
// Adicione: MERCADOPAGO_ACCESS_TOKEN = TEST-6756611187520583-072523-4c3229768706ed16219da6958c53f4c4-47637780

// 3. CÓDIGO PARA CREATE PREFERENCE:
function createPreference(msg) {
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
}

// 4. CÓDIGO PARA PROCESS PAYMENT:
function processPayment(msg) {
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
}

// 5. CÓDIGO PARA WEBHOOK:
function webhookHandler(msg) {
    const { data, type } = msg.payload;
    
    if (type === 'payment') {
        const paymentId = data.id;
        
        // Aqui você pode adicionar lógica para atualizar Firebase
        // ou enviar notificação
        
        msg.payload = {
            received: true,
            payment_id: paymentId,
            type: type
        };
    }
    
    return msg;
}

// 6. CONFIGURAÇÃO DO FLOW:
/*
1. HTTP IN node:
   - Method: POST
   - URL: /api/mercado-pago/create-preference
   - Conecte para um Function node com o código createPreference

2. HTTP IN node:
   - Method: POST  
   - URL: /api/mercado-pago/process-payment
   - Conecte para um Function node com o código processPayment

3. HTTP IN node:
   - Method: POST
   - URL: /api/mercado-pago/webhook
   - Conecte para um Function node com o código webhookHandler

4. HTTP RESPONSE nodes:
   - Conecte cada Function node para um HTTP RESPONSE
   - Status Code: 200 (ou msg.statusCode se houver erro)
*/ 