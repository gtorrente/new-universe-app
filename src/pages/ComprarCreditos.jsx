import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaCoins, 
  FaStar, 
  FaCheck, 
  FaCreditCard,
  FaQrcode,
  FaSpinner,
  FaGem
} from 'react-icons/fa';
import { auth, db } from '../firebaseConfigFront';
import { doc, getDoc } from 'firebase/firestore';

// Inicializar Mercado Pago
const initMercadoPago = () => {
  const script = document.createElement('script');
  script.src = 'https://sdk.mercadopago.com/js/v2';
  script.onload = () => {
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
    if (publicKey && window.MercadoPago) {
      window.mp = new window.MercadoPago(publicKey);
    }
  };
  document.head.appendChild(script);
};

const ComprarCreditos = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState('essencial');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pix'); // Novo estado

  // Inicializar Mercado Pago quando o componente monta
  useEffect(() => {
    initMercadoPago();
  }, []);

  // Pacotes de créditos
  const packages = [
    {
      id: 'basico',
      name: 'Pacote Básico',
      credits: 5,
      price: 12.50,
      pricePerCredit: 2.50,
      incentive: 'Entrada rápida',
      description: 'Ideal para começar sua jornada no universo místico',
      color: 'from-blue-500 to-purple-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'essencial',
      name: 'Pacote Essencial',
      credits: 10,
      price: 19.90,
      pricePerCredit: 1.99,
      incentive: '⭐️ Melhor custo-benefício',
      description: 'O preferido da galera! Dá pra fazer seu mapa completo, tirar tarot e ainda sobra pra perguntar o que quiser à Cátia.',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50',
      popular: true
    },
    {
      id: 'premium',
      name: 'Pacote Premium',
      credits: 20,
      price: 34.90,
      pricePerCredit: 1.74,
      incentive: 'Economia máxima',
      description: 'Pra quem quer mergulhar de vez no seu universo. Mais previsões, mais magia, mais você 💫',
      color: 'from-pink-500 to-red-500',
      borderColor: 'border-pink-200',
      bgColor: 'bg-pink-50'
    }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCreditos(userSnap.data().creditos || 0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePurchase = async () => {
    if (!user) return;
    
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
    
    console.log('🚀 Iniciando compra:', {
      package: selectedPkg,
      paymentMethod: selectedPaymentMethod,
      user: user.email
    });
    
    // Navegar para página de checkout com os dados do pacote e método de pagamento
    navigate('/checkout-pagamento', {
      state: {
        packageData: selectedPkg,
        paymentMethod: selectedPaymentMethod,
        user: user
      }
    });
  };

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
          <h1 className="text-lg font-bold text-gray-800">Comprar Créditos</h1>
          <div className="flex items-center gap-2 text-purple-600">
            <FaCoins />
            <span className="font-semibold">{creditos}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 pb-20">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <FaGem size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Expanda seu <span className="text-purple-600">Universo</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Escolha o pacote ideal para continuar sua jornada mística
          </p>
        </motion.div>

        {/* Pacotes */}
        <div className="space-y-4 mb-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative border-2 rounded-2xl p-6 transition-all cursor-pointer ${
                selectedPackage === pkg.id
                  ? `${pkg.borderColor} ${pkg.bgColor} shadow-lg scale-[1.02]`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {/* Badge Popular */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1 px-4 rounded-full">
                    MAIS POPULAR
                  </div>
                </div>
              )}

              {/* Radio Button */}
              <div className="absolute top-4 right-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPackage === pkg.id
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPackage === pkg.id && (
                    <FaCheck size={12} className="text-white" />
                  )}
                </div>
              </div>

              {/* Conteúdo do Pacote */}
              <div className="pr-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center`}>
                    <FaCoins size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{pkg.incentive}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {pkg.credits} <span className="text-lg text-gray-500">créditos</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {pkg.price.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-gray-500">
                      R$ {pkg.pricePerCredit.toFixed(2).replace('.', ',')} por crédito
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Métodos de Pagamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 mb-6 border border-gray-200"
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCreditCard className="text-purple-500" />
            Métodos de Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedPaymentMethod('pix')}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedPaymentMethod === 'pix'
                  ? 'bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-200'
                  : 'bg-blue-50 border-2 border-transparent hover:bg-blue-100'
              }`}
            >
              <FaQrcode className="text-blue-500" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">PIX</p>
                <p className="text-xs text-gray-600">Aprovação instantânea</p>
              </div>
              {selectedPaymentMethod === 'pix' && (
                <FaCheck className="ml-auto text-blue-500" size={16} />
              )}
            </button>
            <button
              onClick={() => setSelectedPaymentMethod('card')}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedPaymentMethod === 'card'
                  ? 'bg-green-100 border-2 border-green-500 ring-2 ring-green-200'
                  : 'bg-green-50 border-2 border-transparent hover:bg-green-100'
              }`}
            >
              <FaCreditCard className="text-green-500" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">Cartão</p>
                <p className="text-xs text-gray-600">Crédito ou débito</p>
              </div>
              {selectedPaymentMethod === 'card' && (
                <FaCheck className="ml-auto text-green-500" size={16} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Botão de Compra */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handlePurchase}
          disabled={!user}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {!user ? (
            <>
              <FaSpinner className="animate-spin" />
              Carregando usuário...
            </>
          ) : (
            <>
              Comprar {packages.find(pkg => pkg.id === selectedPackage)?.credits} créditos
              por R$ {packages.find(pkg => pkg.id === selectedPackage)?.price.toFixed(2).replace('.', ',')}
              via {selectedPaymentMethod === 'pix' ? 'PIX' : 'Cartão'}
            </>
          )}
        </motion.button>

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            💳 Pagamento 100% seguro via Mercado Pago
          </p>
          <p className="text-xs text-gray-500 mt-1">
            🔒 Seus dados estão protegidos
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ComprarCreditos; 