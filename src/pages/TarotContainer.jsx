// Container que decide qual versão do Tarot mostrar baseado no status premium
import { useState, useEffect } from "react";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import { usePremiumModal } from "../hooks/usePremiumModal";

// Importar ambas as versões
import TarotCompleto from './Tarot';
import TarotSimples from './TarotSimple';
import PremiumModal from '../components/PremiumModal';

// Componente de loading
function TarotLoading() {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-purple-700 mb-2">🎴 Carregando Tarot...</h2>
        <p className="text-gray-600">Verificando seu acesso premium</p>
      </div>
    </div>
  );
}

// Componente de upgrade premium
function TarotUpgrade({ onUseFree, onUpgrade }) {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center max-w-md">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Tarot Premium Disponível!
        </h2>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-purple-700 mb-3">✨ Recursos Premium:</h3>
          <ul className="text-sm text-gray-700 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✅</span>
              <span>Escolha quantas cartas tirar: 1, 3 ou 5 — como preferir se aprofundar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✅</span>
              <span>Um ambiente mágico e envolvente pra você se conectar de verdade</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✅</span>
              <span>Ritual guiado com voz acolhedora pra entrar no clima certo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✅</span>
              <span>Respostas únicas, com mensagens que parecem ter sido feitas só pra você</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition transform hover:scale-105"
          >
            🚀 Upgrade para Premium
          </button>
          
          <button
            onClick={onUseFree}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
          >
            Continuar com versão gratuita
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Você ainda pode usar o Tarot básico gratuitamente
        </p>
      </div>
    </div>
  );
}

export default function TarotContainer() {
  const { isPremium, loading } = usePremiumStatus();
  const { showModal, handleOpenModal, handleCloseModal, handleSubscribe } = usePremiumModal();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [useFreeTarot, setUseFreeTarot] = useState(false);

  // Mostrar upgrade na primeira vez para usuários não-premium
  useEffect(() => {
    if (!loading && !isPremium) {
      setShowUpgrade(true);
    }
  }, [loading, isPremium]);

  // Mostrar loading
  if (loading) {
    return <TarotLoading />;
  }

  // Mostrar upgrade para não-premium (primeira vez)
  if (showUpgrade && !isPremium && !useFreeTarot) {
    return (
      <>
        <TarotUpgrade 
          onUseFree={() => {
            setUseFreeTarot(true);
            setShowUpgrade(false);
          }}
          onUpgrade={handleOpenModal}
        />
        <PremiumModal 
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubscribe={handleSubscribe}
        />
      </>
    );
  }

  // Renderizar versão baseada no status
  if (isPremium) {
    console.log('🌟 Renderizando Tarot Premium Completo');
    return <TarotCompleto />;
  } else {
    console.log('🎴 Renderizando Tarot Gratuito Simples');
    return (
      <>
        <TarotSimples />
        <PremiumModal 
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubscribe={handleSubscribe}
        />
      </>
    );
  }
}