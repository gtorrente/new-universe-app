import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaCoins, 
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { db } from '../firebaseConfigFront';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';

const CheckoutPagamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { packageData, user } = location.state || {};
  
  // Debug logs
  useEffect(() => {
    console.log('🎯 CheckoutPagamento carregado');
    console.log('📦 Package Data:', packageData);
    console.log('👤 User:', user?.email);
    
    if (!packageData || !user) {
      console.error('❌ Dados obrigatórios faltando!');
      alert('Erro: Dados de pagamento não encontrados. Redirecionando...');
      navigate('/comprar-creditos');
    }
  }, [packageData, user, navigate]);
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [brickController, setBrickController] = useState(null);
  
  const paymentBrickRef = useRef(null);

  // Inicializar Mercado Pago
  useEffect(() => {
    const initMercadoPago = () => {
      // Verificar se já existe
      if (window.MercadoPago) {
        setMpLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY_TEST || 'TEST-97acbda3-ba7d-4786-a525-c40c19f88843';
        if (window.MercadoPago) {
          window.mp = new window.MercadoPago(publicKey);
          setMpLoaded(true);
        }
      };
      document.head.appendChild(script);
    };

    initMercadoPago();
  }, []);

  // Criar Payment Brick quando MP estiver carregado
  useEffect(() => {
    if (mpLoaded && packageData && paymentBrickRef.current && !brickController) {
      createPaymentBrick();
    }
  }, [mpLoaded, packageData]);

  const createPaymentBrick = async () => {
    try {
      console.log('🧱 Iniciando criação do Payment Brick');
      const bricksBuilder = window.mp.bricks();
      
      // Criar preference de pagamento
      console.log('📋 Criando preference...');
      const preference = await createPreference();
      console.log('✅ Preference criada:', preference.id);
      
      const renderPaymentBrick = async () => {
        console.log('🎨 Renderizando Payment Brick no container');
        const controller = await bricksBuilder.create('payment', 'payment-brick-container', {
          initialization: {
            amount: packageData.price,
            preferenceId: preference.id,
          },
          locale: 'pt-BR', // Configurar para português do Brasil
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              ticket: 'all',
              bankTransfer: 'all',
              mercadoPago: 'all',
            },
            visual: {
              style: {
                theme: 'default'
              }
            },
            texts: {
              formTitle: 'Formas de pagamento',
              emailSectionTitle: 'E-mail',
              installmentsSectionTitle: 'Parcelas',
              cardNumberSectionTitle: 'Dados do cartão',
              securityCodeSectionTitle: 'Código de segurança',
              expirationDateSectionTitle: 'Data de validade',
              cardholderNameSectionTitle: 'Nome do titular',
              issuerSectionTitle: 'Banco emissor',
              installmentsDefaultTitle: 'Escolha o número de parcelas',
              cardNumberPlaceholder: 'Número do cartão',
              expirationDatePlaceholder: 'MM/AA',
              securityCodePlaceholder: 'Código',
              cardholderNamePlaceholder: 'Nome como aparece no cartão',
              installmentsPlaceholder: 'Selecione'
            }
          },
          callbacks: {
            onReady: () => {
              console.log('Payment Brick ready');
            },
            onSubmit: ({ selectedPaymentMethod, formData }) => {
              handlePaymentSubmit(selectedPaymentMethod, formData, preference.id);
            },
            onError: (error) => {
              console.error('Payment Brick error:', error);
            },
          },
        });
        
        setBrickController(controller);
      };

      renderPaymentBrick();
    } catch (error) {
      console.error('Erro ao criar Payment Brick:', error);
    }
  };

  const createPreference = async () => {
    try {
      console.log('🚀 Criando preference com dados:', {
        packageData,
        user: user.email
      });

      // MOCK TEMPORÁRIO - Simular resposta do MP para testar interface
      console.log('⚠️ USANDO MOCK - Backend indisponível');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      return {
        id: 'MOCK-PREFERENCE-123',
        init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=MOCK',
        sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=MOCK'
      };

      // CÓDIGO ORIGINAL (desabilitado temporariamente)
      /*
      const response = await fetch('http://localhost:3001/api/mercado-pago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            title: packageData.name,
            description: `${packageData.credits} créditos para o Universo Catia`,
            unit_price: packageData.price,
            quantity: 1,
          }],
          payer: {
            email: user.email,
          },
          metadata: {
            user_id: user.uid,
            package_id: packageData.id,
            credits: packageData.credits,
          },
          notification_url: `http://localhost:3001/api/mercado-pago/webhook`,
          back_urls: {
            success: `${window.location.origin}/pagamento-sucesso`,
            failure: `${window.location.origin}/pagamento-falha`,
            pending: `${window.location.origin}/pagamento-pendente`,
          },
          auto_return: 'approved',
        }),
      });

      console.log('📡 Resposta do backend:', response.status);

      if (!response.ok) {
        throw new Error('Erro ao criar preference');
      }

      return await response.json();
      */
    } catch (error) {
      console.error('Erro ao criar preference:', error);
      throw error;
    }
  };

  const handlePaymentSubmit = async (selectedPaymentMethod, formData, preferenceId) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/mercado-pago/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPaymentMethod,
          formData,
          preferenceId,
          userId: user.uid,
          packageData,
        }),
      });

      const result = await response.json();
      
      if (result.status === 'approved') {
        setPaymentStatus('success');
        // Adicionar créditos imediatamente para melhor UX
        await addCreditsToUser(packageData.credits);
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      } else if (result.status === 'pending') {
        setPaymentStatus('pending');
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const addCreditsToUser = async (credits) => {
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, {
        creditos: increment(credits)
      });

      // Registrar transação
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        packageId: packageData.id,
        credits: credits,
        amount: packageData.price,
        status: 'completed',
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
    }
  };

  if (!packageData || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Dados de pagamento não encontrados</p>
          <button
            onClick={() => navigate('/comprar-creditos')}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition"
          >
            Voltar para seleção de pacotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-purple-100 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition"
          >
            <FaArrowLeft />
            <span>Voltar</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Finalizar Pagamento</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Resumo do Pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 mb-6 border border-gray-200"
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCoins className="text-purple-500" />
            Resumo do Pedido
          </h3>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-gray-800">{packageData.name}</p>
              <p className="text-sm text-gray-600">{packageData.credits} créditos</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              R$ {packageData.price.toFixed(2).replace('.', ',')}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500">
              {packageData.description}
            </p>
          </div>
        </motion.div>

        {/* Status de Pagamento */}
        {paymentStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-2xl p-6 mb-6 border-2 text-center ${
              paymentStatus === 'success' ? 'border-green-200 bg-green-50' :
              paymentStatus === 'pending' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}
          >
            {paymentStatus === 'success' && (
              <>
                <FaCheck className="text-green-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700 mb-2">Pagamento Aprovado!</h3>
                <p className="text-green-600">
                  {packageData.credits} créditos foram adicionados à sua conta.
                </p>
                <p className="text-sm text-green-500 mt-2">
                  Redirecionando para o app em breve...
                </p>
              </>
            )}
            
            {paymentStatus === 'pending' && (
              <>
                <FaSpinner className="text-yellow-500 text-4xl mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-yellow-700 mb-2">Pagamento Pendente</h3>
                <p className="text-yellow-600">
                  Aguardando confirmação do pagamento.
                </p>
              </>
            )}
            
            {paymentStatus === 'error' && (
              <>
                <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-700 mb-2">Erro no Pagamento</h3>
                <p className="text-red-600">
                  Houve um problema com seu pagamento. Tente novamente.
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Payment Brick Container (conditional rendering) */}
        {!paymentStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              💳 Escolha a forma de pagamento
            </h3>
            
            {/* Mensagem temporária sobre o problema */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-orange-800 mb-2">🚧 Sistema em Configuração</h4>
              <p className="text-orange-700 text-sm mb-3">
                O backend está sendo configurado. Estamos usando um mock temporário para testar a interface.
              </p>
              <p className="text-orange-600 text-xs">
                <strong>Problemas identificados:</strong><br/>
                1. Backend Mercado Pago precisa ser reiniciado<br/>
                2. Credenciais de teste podem precisar de ajuste<br/>
                3. Verificar se todas as dependências estão instaladas
              </p>
            </div>
            
            <div 
              id="payment-brick-container" 
              ref={paymentBrickRef} 
              className={`min-h-[300px] ${!mpLoaded ? 'hidden' : ''}`}
            >
              {!mpLoaded && (
                <div className="flex items-center justify-center h-64">
                  <span className="text-gray-600">Carregando métodos de pagamento...</span>
                </div>
              )}
            </div>
            
            {/* Botão de teste temporário */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-700 mb-2">🧪 Teste Temporário</h4>
              <button
                onClick={() => {
                  console.log('🧪 Simulando pagamento aprovado');
                  setPaymentStatus('success');
                  addCreditsToUser(packageData.credits);
                  setTimeout(() => navigate('/'), 3000);
                }}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition"
              >
                ✅ Simular Pagamento Aprovado (TESTE)
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Clique para simular um pagamento aprovado e adicionar os créditos
              </p>
            </div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">Processando pagamento...</p>
              <p className="text-sm text-gray-500 mt-2">Não feche esta página</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPagamento; 