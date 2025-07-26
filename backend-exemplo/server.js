// Servidor Backend de exemplo para Mercado Pago
// Execute com: node server.js
// Instale as dependências: npm install express cors mercadopago firebase-admin

const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Mercado Pago com suas credenciais
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-5236189943574221-031723-12016251c249e02b0836c2c14a624eec-47637780',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const payment = new Payment(client);
const preference = new Preference(client);

// Middleware
app.use(cors());
app.use(express.json());

// Rota para criar preference de pagamento
app.post('/api/mercado-pago/create-preference', async (req, res) => {
  try {
    const { items, payer, metadata, notification_url, back_urls } = req.body;

    const preferenceData = {
      items: items,
      payer: payer,
      metadata: metadata,
      notification_url: notification_url,
      back_urls: back_urls,
      auto_return: 'approved',
      statement_descriptor: 'UNIVERSO CATIA'
    };

    const result = await preference.create({ body: preferenceData });
    
    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });
  } catch (error) {
    console.error('Erro ao criar preference:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para processar pagamento direto (Payment Brick)
app.post('/api/mercado-pago/process-payment', async (req, res) => {
  try {
    const { selectedPaymentMethod, formData, userId, packageData } = req.body;

    const paymentData = {
      transaction_amount: packageData.price,
      token: formData.token || undefined,
      description: `${packageData.name} - ${packageData.credits} créditos`,
      installments: formData.installments || 1,
      payment_method_id: selectedPaymentMethod,
      issuer_id: formData.issuer_id || undefined,
      payer: {
        email: formData.payer?.email,
        identification: formData.payer?.identification || undefined,
      },
      metadata: {
        user_id: userId,
        package_id: packageData.id,
        credits: packageData.credits
      }
    };

    // Processar pagamento PIX
    if (selectedPaymentMethod === 'pix') {
      paymentData.payment_method_id = 'pix';
      delete paymentData.token;
      delete paymentData.installments;
      delete paymentData.issuer_id;
    }

    const result = await payment.create({ body: paymentData });

    res.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      point_of_interaction: result.point_of_interaction
    });

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para receber notificações do Mercado Pago
app.post('/api/mercado-pago/webhook', async (req, res) => {
  try {
    const { data, type } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const paymentInfo = await payment.get({ id: paymentId });
      
      if (paymentInfo.status === 'approved') {
        const { user_id, credits } = paymentInfo.metadata;
        
        // Aqui você adicionaria os créditos ao usuário no Firebase
        console.log(`✅ Pagamento aprovado! Adicionar ${credits} créditos ao usuário ${user_id}`);
        
        // Exemplo de como adicionar créditos no Firebase:
        /*
        const admin = require('firebase-admin');
        const userRef = admin.firestore().doc(`usuarios/${user_id}`);
        await userRef.update({
          creditos: admin.firestore.FieldValue.increment(credits)
        });
        */
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de status de pagamento
app.get('/api/mercado-pago/payment-status/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const result = await payment.get({ id: paymentId });
    
    res.json({
      status: result.status,
      status_detail: result.status_detail,
      transaction_amount: result.transaction_amount
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/api/mercado-pago/webhook`);
});

module.exports = app; 