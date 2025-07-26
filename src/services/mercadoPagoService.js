// Serviço para integração com Mercado Pago
// Substitua pela sua implementação real com suas credenciais

const MERCADO_PAGO_CONFIG = {
  // Substitua pela sua URL de API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  // Substitua pelo seu access token do Mercado Pago
  accessToken: import.meta.env.VITE_MP_ACCESS_TOKEN
};

export const createPayment = async (paymentData) => {
  try {
    const response = await fetch(`${MERCADO_PAGO_CONFIG.apiUrl}/mercado-pago/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
};

export const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await fetch(`${MERCADO_PAGO_CONFIG.apiUrl}/mercado-pago/payment-status/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw error;
  }
};

// Exemplo de estrutura de dados para enviar ao Mercado Pago
export const createPaymentData = (userId, packageData) => {
  return {
    transaction_amount: packageData.price,
    description: `${packageData.name} - ${packageData.credits} créditos`,
    payment_method_id: 'pix', // ou 'credit_card', 'debit_card', etc.
    payer: {
      email: 'user@example.com', // Email do usuário
      identification: {
        type: 'CPF',
        number: '12345678901' // CPF do usuário
      }
    },
    notification_url: `${MERCADO_PAGO_CONFIG.apiUrl}/mercado-pago/webhook`,
    external_reference: `${userId}-${packageData.id}-${Date.now()}`,
    metadata: {
      user_id: userId,
      package_id: packageData.id,
      credits: packageData.credits
    }
  };
};

export default {
  createPayment,
  checkPaymentStatus,
  createPaymentData
}; 