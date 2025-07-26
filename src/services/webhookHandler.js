// Exemplo de handler para webhooks do Mercado Pago
// Este código deve rodar no seu backend (Node.js, Python, etc.)

import { doc, updateDoc, increment, addDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfigFront';

// Estrutura dos pacotes (deve ser a mesma do frontend)
const PACKAGES = {
  'basico': { credits: 5, price: 12.50 },
  'essencial': { credits: 10, price: 19.90 },
  'premium': { credits: 20, price: 34.90 }
};

export const handleMercadoPagoWebhook = async (webhookData) => {
  try {
    const { data, type } = webhookData;
    
    // Verificar se é uma notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento no Mercado Pago
      const paymentDetails = await getPaymentDetails(paymentId);
      
      if (paymentDetails.status === 'approved') {
        // Extrair informações do metadata
        const { user_id, package_id, credits } = paymentDetails.metadata;
        
        // Verificar se o pagamento já foi processado
        const alreadyProcessed = await checkIfPaymentProcessed(paymentId);
        if (alreadyProcessed) {
          console.log('Pagamento já processado:', paymentId);
          return { success: true, message: 'Pagamento já processado' };
        }
        
        // Adicionar créditos ao usuário
        await addCreditsToUser(user_id, credits);
        
        // Registrar a transação
        await registerTransaction({
          userId: user_id,
          paymentId: paymentId,
          packageId: package_id,
          credits: credits,
          amount: paymentDetails.transaction_amount,
          status: 'completed',
          processedAt: new Date()
        });
        
        console.log(`✅ Créditos adicionados: ${credits} para usuário ${user_id}`);
        
        return { success: true, message: 'Pagamento processado com sucesso' };
      } else {
        console.log('Pagamento não aprovado:', paymentDetails.status);
        return { success: false, message: 'Pagamento não aprovado' };
      }
    }
    
    return { success: true, message: 'Webhook recebido' };
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return { success: false, message: 'Erro interno', error: error.message };
  }
};

const getPaymentDetails = async (paymentId) => {
  // Implementar chamada para API do Mercado Pago
  const accessToken = import.meta.env.VITE_MP_ACCESS_TOKEN;
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
};

const checkIfPaymentProcessed = async (paymentId) => {
  // Verificar no Firestore se o pagamento já foi processado
  try {
    const transactionRef = doc(db, 'transactions', paymentId);
    const transactionSnap = await getDoc(transactionRef);
    return transactionSnap.exists();
  } catch (error) {
    console.error('Erro ao verificar transação:', error);
    return false;
  }
};

const addCreditsToUser = async (userId, credits) => {
  try {
    const userRef = doc(db, 'usuarios', userId);
    await updateDoc(userRef, {
      creditos: increment(credits)
    });
    console.log(`➕ ${credits} créditos adicionados ao usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    throw error;
  }
};

const registerTransaction = async (transactionData) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    await addDoc(transactionsRef, transactionData);
    console.log('📝 Transação registrada:', transactionData.paymentId);
  } catch (error) {
    console.error('Erro ao registrar transação:', error);
    throw error;
  }
};

// Exemplo de uso no seu servidor Express.js:
/*
app.post('/webhook/mercado-pago', async (req, res) => {
  try {
    const result = await handleMercadoPagoWebhook(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
*/

export default {
  handleMercadoPagoWebhook,
  addCreditsToUser,
  registerTransaction
}; 