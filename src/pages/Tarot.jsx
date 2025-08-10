// Página do Tarot do app Universo Catia
// Permite fazer perguntas e receber orientações através de cartas do tarot com interpretação da IA

import { useState, useEffect, useCallback, useRef } from "react";
// import { AiOutlineHome } from "react-icons/ai"; // Não usado
import cartasData from "../tarot.json";
import { db, addDoc, collection, auth } from "../firebaseConfigFront";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import { usePremiumModal } from "../hooks/usePremiumModal";
import PremiumModal from "../components/PremiumModal";

// Componente principal do Tarot
export default function Tarot() {
  const navigate = useNavigate();
  // const backgroundMusicRef = useRef(null); // Removido temporariamente
  
  // --- VERIFICAÇÃO PREMIUM ---
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const { showModal, handleOpenModal, handleCloseModal, handleSubscribe } = usePremiumModal();
  
  // --- ESTADOS GLOBAIS DO FLUXO ---
  const [usuario, setUsuario] = useState(null); // Usuário autenticado
  const [creditos, setCreditos] = useState(0); // Créditos do usuário
  const [step, setStep] = useState(1); // Etapa do fluxo (1: pergunta, 2: preparação, 3: embaralhar, 4: escolher, 5: resultado)
  const [spreadType, setSpreadType] = useState('single'); // Tipo de leitura
  const [isAudioEnabled] = useState(true); // Controle de áudio (sempre ativo)
  const [atmosphere, setAtmosphere] = useState('default'); // Atmosfera atual

  // --- ESTADOS DO JOGO ---
  const [nome, setNome] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [cartas, setCartas] = useState(cartasData?.cartas || []);
  const [cartasEscolhidas, setCartasEscolhidas] = useState([]);
  const [respostaIA, setRespostaIA] = useState("");
  const [loading, setLoading] = useState(false);


  // Chave da API OpenAI para interpretação das cartas
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // --- SISTEMA DE ÁUDIO IMERSIVO ---
  const audioContextRef = useRef(null);
  const playSound = useCallback((soundType) => {
    if (!isAudioEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      const generateTone = (frequency, duration, type = 'sine') => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (soundType) {
        case 'cardFlip':
          generateTone(800, 0.1, 'square');
          setTimeout(() => generateTone(600, 0.1, 'square'), 50);
          break;
        case 'cardSelect':
          generateTone(1000, 0.15, 'sine');
          break;
        case 'shuffle':
          for (let i = 0; i < 4; i++) {
            setTimeout(() => generateTone(400 + Math.random() * 200, 0.05, 'sawtooth'), i * 35);
          }
          break;
        case 'meditation':
          generateTone(528, 0.6, 'sine');
          break;
        case 'success':
          generateTone(523, 0.18, 'sine');
          setTimeout(() => generateTone(659, 0.18, 'sine'), 100);
          setTimeout(() => generateTone(784, 0.25, 'sine'), 200);
          break;
        default:
          generateTone(440, 0.1, 'sine');
      }
    } catch (error) {
      console.log('🔇 Áudio não disponível:', error?.message || String(error));
    }
  }, [isAudioEnabled]);

  // --- ATMOSFERA DINÂMICA ---
  const getCurrentAtmosphere = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'lua-cheia';
    if (hour < 12) return 'amanhecer';
    if (hour < 18) return 'sol';
    return 'crepusculo';
  };

  // Respeitar preferência do usuário por menos movimento
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)')?.matches;

  const atmosphereConfigs = {
    'default': {
      gradient: 'from-purple-100 to-blue-100',
      particles: '✨',
      music: 'default-ambient'
    },
    'lua-cheia': {
      gradient: 'from-indigo-900 via-purple-900 to-blue-900',
      particles: '🌙',
      music: 'mystical-night'
    },
    'amanhecer': {
      gradient: 'from-pink-200 via-orange-200 to-yellow-200',
      particles: '🌅',
      music: 'morning-meditation'
    },
    'sol': {
      gradient: 'from-yellow-200 via-orange-200 to-red-200',
      particles: '☀️',
      music: 'warm-ambient'
    },
    'crepusculo': {
      gradient: 'from-purple-300 via-pink-300 to-orange-300',
      particles: '🌆',
      music: 'evening-mystical'
    }
  };

  // --- AUTENTICAÇÃO: escuta usuário logado e define nome ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (user && user.displayName) {
        setNome(user.displayName.split(" ")[0]);
        setStep(1);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- INICIALIZAR ATMOSFERA ---
  useEffect(() => {
    try {
      const currentAtmosphere = getCurrentAtmosphere();
      setAtmosphere(currentAtmosphere);
      
      // Iniciar música de fundo somente após interação do usuário
      // playSound('background'); // Desabilitado temporariamente
    } catch (error) {
      console.error('Erro ao inicializar atmosfera:', error);
      setAtmosphere('default');
    }
  }, []);

  // --- BUSCA CRÉDITOS E VERIFICA JOGO DIÁRIO: sempre que usuario mudar ---
  useEffect(() => {
    const buscarDadosUsuario = async () => {
      if (usuario) {
        const userRef = doc(db, "usuarios", usuario.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCreditos(userData.creditos || 0);
          console.log("🎴 Tarot: Créditos disponíveis:", userData.creditos || 0);
        } else {
          setCreditos(0);
        }
      } else {
        setCreditos(0);
      }
    };
    buscarDadosUsuario();
  }, [usuario]);

  // --- CONFIGURAÇÃO DE SPREADS ---
  const spreads = [
    { id: 'single', name: 'Uma Carta', cards: 1, desc: 'Uma mensagem objetiva para o agora' },
    { id: 'three', name: 'Três Cartas', cards: 3, desc: 'Entenda sua jornada no tempo' },
    { id: 'five', name: 'Pentagrama', cards: 5, desc: 'Um mergulho profundo no seu momento' }
  ];

  const getSpreadConfig = (spreadId) => {
    return spreads.find(s => s.id === spreadId) || spreads[0];
  };

  // --- EMBARALHAR CARTAS ---
  const embaralharCartas = () => {
    playSound('shuffle');
    setCartas([...cartas].sort(() => Math.random() - 0.5));
    setStep(4);
  };

  // --- ESCOLHER CARTAS ---
  const escolherCarta = (carta) => {
    playSound('cardSelect');
    const spreadConfig = getSpreadConfig(spreadType);
    
    // Verificar se a carta já foi escolhida (evitar repetidas)
    const jaEscolhida = cartasEscolhidas.some(c => c.number === carta.number);
    
    if (cartasEscolhidas.length < spreadConfig.cards && !jaEscolhida) {
      setCartasEscolhidas([...cartasEscolhidas, carta]);
      
      if (cartasEscolhidas.length + 1 >= spreadConfig.cards) {
        setStep(5);
      }
    }
  };

  // --- RITUAL DE PREPARAÇÃO ---
  const iniciarRitual = () => {
    playSound('meditation');
    setStep(2);
  };

  const completarRitual = () => {
    playSound('success');
    setStep(3);
  };

  // --- JOGAR NOVAMENTE ---
  const handleJogar = async () => {
    if (creditos === 0) {
      alert("⚠️ Você não possui créditos suficientes para jogar. Adquira mais créditos.");
      return;
    }
    
    setStep(1);
    setPergunta("");
    setRespostaIA("");
    setCartasEscolhidas([]);
    setSpreadType('single');
  };

  // --- GERAR RESPOSTA DA IA AVANÇADA ---
  const gerarRespostaIA = async () => {
    if (creditos === 0) {
      setRespostaIA("⚠️ Você não possui créditos suficientes para jogar. Adquira mais créditos.");
      return;
    }
    
    if (!usuario) {
      setRespostaIA("Erro: Usuário não autenticado.");
      return;
    }
    
    if (cartasEscolhidas.length === 0 || !pergunta) {
      setRespostaIA("⚠️ Complete a leitura antes de interpretar.");
      return;
    }
    
    setLoading(true);
    playSound('meditation');

    // Prompt mais compacto para reduzir latência
    const spreadConfig = getSpreadConfig(spreadType);
    const currentAtmosphere = atmosphereConfigs[atmosphere];
    
    const compactPrompt = `
Pergunta: ${pergunta}
Leitura: ${spreadConfig.name} (${spreadConfig.cards} cartas) — ${spreadConfig.desc}
Usuário: ${nome || 'Usuário'} | Atmosfera: ${atmosphere} (${currentAtmosphere.particles})
Cartas:
${cartasEscolhidas.map((carta, idx) => `${idx + 1}. ${carta.name} — ${carta.arcano}`).join('\n')}

Instruções: Em até 6-10 parágrafos curtos, faça:
- Visão geral (2 frases)
- Interpretação de cada carta aplicada à pergunta
- Síntese prática (3 conselhos objetivos)
Tom: acolhedor, claro, direto, místico sem exageros.
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "Você é Catia, leitora de Tarô experiente e direta. Responda de forma clara, empática e aplicada à pergunta. Evite enrolação, foque em orientações práticas e conexão entre cartas." 
            },
            { role: "user", content: compactPrompt }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      });
      
      if (!response.ok) throw new Error(`Erro da API: ${response.status}`);
      
      const data = await response.json();
      const respostaGerada = data.choices[0].message.content.trim();
      setRespostaIA(respostaGerada);
      playSound('success');
      
      // Salva a leitura no Firestore
      await addDoc(collection(db, "leituras_tarot"), {
        userId: usuario.uid,
        nome,
        pergunta,
        spreadType: spreadConfig.name,
        cartas: cartasEscolhidas.map(c => ({
          name: c.name,
          description: c.description,
          arcano: c.arcano
        })),
        resposta: respostaGerada,
        atmosphere,
        timestamp: new Date()
      });
      
      // Desconta crédito
      await setDoc(doc(db, "usuarios", usuario.uid), { 
        ultimoJogo: new Date(),
        creditos: creditos - 1
      }, { merge: true });
      
      setCreditos((prev) => prev - 1);
    } catch (error) {
      console.error("Erro ao gerar resposta IA:", error);
      setRespostaIA("Algo deu errado ao gerar sua resposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFICAÇÃO DE SEGURANÇA PREMIUM ---
  if (premiumLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-purple-700 mb-2">🎴 Verificando Acesso...</h2>
          <p className="text-gray-600">Validando seu status premium</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            Tarot Premium Bloqueado
          </h2>
          <p className="text-gray-600 mb-6">
            Este é o Tarot Premium completo. Você precisa ser um membro premium para acessar esta versão.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              🏠 Voltar ao Início
            </button>
            <button
              onClick={handleOpenModal}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition"
            >
              ⭐ Upgrade Premium
            </button>
          </div>
        </div>
        
        <PremiumModal 
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubscribe={handleSubscribe}
        />
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  const currentAtmosphere = atmosphereConfigs[atmosphere] || atmosphereConfigs['default'];
  
  try {
    return (
      <div className={`bg-gradient-to-br ${currentAtmosphere?.gradient || 'from-purple-100 to-blue-100'} min-h-screen relative overflow-hidden`}>
        {/* Overlay para garantir contraste mínimo de texto em qualquer gradiente */}
        <div className="absolute inset-0 bg-black/40 md:bg-black/30 pointer-events-none" />

        {/* Partículas atmosféricas - respeita prefers-reduced-motion */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="particles-container">
            {[...Array(prefersReducedMotion ? 0 : 8)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  y: [-50, -150],
                  x: Math.sin(i) * 30
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              >
                {currentAtmosphere?.particles || '✨'}
              </motion.div>
            ))}
          </div>
        </div>

      {/* Header global com usuário e créditos */}
      <Header user={usuario} creditos={creditos} isWhiteText={true} />
      


      <div className="w-full max-w-xl mx-auto py-8 px-2 space-y-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Etapa 1: Pergunta e seleção de spread */}
          {step === 1 && (
            <PerguntaStep 
              pergunta={pergunta} 
              setPergunta={setPergunta} 
              spreadType={spreadType}
              setSpreadType={setSpreadType}
              spreads={spreads}
              iniciarRitual={iniciarRitual}
              navigate={navigate} 
              creditos={creditos} 
            />
          )}
          
          {/* Etapa 2: Ritual de preparação */}
          {step === 2 && (
            <RitualStep 
              completarRitual={completarRitual}
              atmosphere={atmosphere}
              currentAtmosphere={currentAtmosphere}
            />
          )}
          
          {/* Etapa 3: Embaralhar */}
          {step === 3 && creditos > 0 && (
            <EmbaralharStep 
              setStep={setStep} 
              embaralharCartas={embaralharCartas}
              atmosphere={atmosphere}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
          
          {/* Etapa 4: Escolha da carta */}
          {step === 4 && creditos > 0 && (
            <EscolherCartaStep 
              cartas={cartas} 
              escolherCarta={escolherCarta}
              cartasEscolhidas={cartasEscolhidas}
              spreadType={spreadType}
              spreads={spreads}
            />
          )}
          
          {/* Etapa 5: Resultado */}
          {step === 5 && cartasEscolhidas.length > 0 && (
            <ResultadoStep
              nome={nome}
              cartasEscolhidas={cartasEscolhidas}
              respostaIA={respostaIA}
              gerarRespostaIA={gerarRespostaIA}
              loading={loading}
              creditos={creditos}
              handleJogar={handleJogar}
              spreadType={spreadType}
              spreads={spreads}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </AnimatePresence>
      </div>

      {/* CSS para partículas */}
      <style>{`
        .particles-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.6;
          pointer-events: none;
          will-change: transform, opacity;
        }
      `}</style>
      </div>
    );
  } catch (error) {
    console.error('Erro no componente Tarot:', error);
    return (
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">🎴 Tarot Temporariamente Indisponível</h2>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar o Tarot. Por favor, recarregue a página.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            🔄 Recarregar Página
          </button>
        </div>
      </div>
    );
  }
}

// Componente da etapa 1: Pergunta e seleção de spread
function PerguntaStep({ pergunta, setPergunta, spreadType, setSpreadType, spreads, iniciarRitual, navigate, creditos }) {
  const semCreditos = creditos === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/10 md:bg-white/15 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center border border-white/40"
    >
             <div className="flex items-center justify-center gap-2 mb-4">
         <h2 className="text-2xl font-semibold text-white">
           🌟 Tarot Premium
         </h2>
         <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
           PREMIUM
         </span>
       </div>
       <p className="text-white text-center mb-2 drop-shadow-lg">
         Vamos ouvir o que o universo tem a dizer?
       </p>
      
      <p className="text-white/90 text-base mb-6 text-center drop-shadow-md">
        Escolha seu tipo de leitura e faça sua pergunta com o coração.
      </p>

      {/* Seleção de Spread */}
      <div className="w-full mb-6">
        <h3 className="text-white font-semibold mb-3 drop-shadow-lg">🎴 Tipo de Leitura:</h3>
        <div className="grid grid-cols-1 gap-3">
          {spreads.map((spread) => (
            <button
              key={spread.id}
              onClick={() => setSpreadType(spread.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                spreadType === spread.id
                  ? 'border-white bg-purple-700/60 text-white shadow-lg'
                  : 'border-white/50 bg-white/10 text-white hover:bg-white/20 shadow-md'
              }`}
            >
              <div className="font-semibold">{spread.name}</div>
              <div className="text-sm opacity-80">{spread.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Campo de pergunta */}
      <input
        type="text"
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
        placeholder="Ex.: Qual o próximo passo no meu relacionamento?"
        className="text-gray-900 px-4 py-3 rounded-lg bg-white border border-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 w-full mb-6 placeholder-gray-600"
        disabled={semCreditos}
        aria-label="Digite sua pergunta"
      />

      {/* Botões */}
      <div className="flex justify-between items-center w-full gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-white font-semibold px-4 py-2 rounded-lg transition hover:bg-white/20 drop-shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80"
        >
          Voltar
        </button>
        <button
          onClick={iniciarRitual}
          className={`bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 ${
            semCreditos ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={semCreditos || pergunta.trim() === ""}
        >
          {semCreditos ? "Sem créditos" : "Iniciar Ritual"}
        </button>
      </div>

      {semCreditos && (
        <div className="mt-4 text-yellow-200 text-sm font-bold text-center">
          Você não possui créditos suficientes para jogar.<br />
          <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300">
            Comprar Créditos
          </button>
        </div>
      )}
    </motion.div>
  );
}

// Componente da etapa 2: Ritual de preparação
function RitualStep({ completarRitual, atmosphere, currentAtmosphere }) {
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    if (!isBreathing) return;
    const breathInterval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev >= 2) {
          clearInterval(breathInterval);
          setIsBreathing(false);
          completarRitual();
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(breathInterval);
  }, [isBreathing, completarRitual]);

  const startBreathing = () => {
    setBreathCount(0);
    setIsBreathing(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 md:bg-white/15 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center border border-white/40"
    >
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
        🧘‍♀️ Prepare-se para a Leitura
      </h2>

      <div className="text-center mb-8">
        <p className="text-white/90 mb-4 drop-shadow-md">
          A energia atual é de <span className="font-semibold text-white">{atmosphere}</span>
        </p>
        <div className="text-4xl mb-4 drop-shadow-lg">{currentAtmosphere.particles}</div>
      </div>

      {!isBreathing ? (
        <div className="text-center">
          <p className="text-white/90 mb-6 drop-shadow-md">
            Quando estiver pronto, toque em começar e respire 3 vezes.
          </p>
          <button
            onClick={startBreathing}
            className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300"
          >
            🌬️ Começar Respiração
          </button>
        </div>
      ) : (
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: 2 - breathCount }}
            className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4"
          >
            <span className="text-2xl">🌬️</span>
          </motion.div>
          <p className="text-white font-semibold drop-shadow-lg">
            Respiração {breathCount + 1} de 3
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Componente da etapa 3: Embaralhar cartas
function EmbaralharStep({ setStep, embaralharCartas, prefersReducedMotion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/10 md:bg-white/15 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center border border-white/40"
    >
      <div className="mb-6 w-full">
        <p className="text-gray-100 font-semibold mb-2 drop-shadow-lg">💫 Dica:</p>
        <p className="text-gray-200 text-sm drop-shadow-md">
          Mentalize sua pergunta com intensidade. Quando sentir que é o momento certo, clique em <span className='font-bold text-purple-200 drop-shadow-sm'>Embaralhar</span>.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">
        🌟 Mentalize sua pergunta...
      </h2>

      <motion.div
        animate={prefersReducedMotion ? {} : { rotateY: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="flex items-center justify-center mb-6"
      >
        <img
          src="/cards/carta-verso-2.png"
          alt="Cátia segurando cartas"
          className="w-32 h-auto rounded-xl shadow-lg border border-white"
          loading="lazy"
        />
      </motion.div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2 w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep(1)}
          className="bg-white/20 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-white/30 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80"
        >
          Voltar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={embaralharCartas}
          className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300"
        >
          🎴 Embaralhar
        </motion.button>
      </div>
    </motion.div>
  );
}

// Componente da etapa 4: Escolher carta
function EscolherCartaStep({ cartas, escolherCarta, cartasEscolhidas, spreadType, spreads }) {
  const spreadConfig = spreads.find(s => s.id === spreadType);
  const cartasRestantes = spreadConfig.cards - cartasEscolhidas.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/10 md:bg-white/15 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center border border-white/40"
    >
      <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">
        Escolha {cartasRestantes} carta{cartasRestantes > 1 ? 's' : ''}
      </h2>
      
      <p className="text-white/90 mb-6 text-center drop-shadow-md">
        {spreadConfig.name}: {spreadConfig.desc}
      </p>



      {/* Grid de cartas para escolha */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {cartas.slice(0, 12).map((carta, idx) => {
          const jaEscolhida = cartasEscolhidas.some(c => c.number === carta.number);
          return (
            <motion.img
              key={idx}
              src="/cards/carta-verso-2.png"
              alt="Verso da carta"
              className={`w-20 h-auto rounded-lg shadow-md border transition-transform bg-white ${
                jaEscolhida 
                  ? 'opacity-30 border-gray-400 cursor-not-allowed' 
                  : 'border-white cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300'
              }`}
              whileHover={jaEscolhida ? {} : { scale: 1.1 }}
              whileTap={jaEscolhida ? {} : { scale: 0.95 }}
              onClick={() => escolherCarta(carta)}
              loading="lazy"
            />
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
                 onClick={() => window.history.back()}
         className="bg-white/20 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-white/30 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80"
       >
         Voltar
       </motion.button>
    </motion.div>
  );
}

// Componente da etapa 5: Resultado da leitura
// Utilitário simples para formatar Markdown básico (**negrito**, *itálico* e quebras de linha)
function formatAITextBasic(text) {
  if (!text) return '';
  const escapeHtml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  let html = escapeHtml(text);
  // Negrito primeiro para não conflitar com itálico
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Itálico simples
  html = html.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
  // Listas simples com hífen: transforma em bullets visuais
  html = html.replace(/(^|\n)[-\u2022]\s+(.+?)(?=\n|$)/g, '$1&#8226; $2');
  // Quebras de linha
  html = html.replace(/\n\n/g, '<br/><br/>' ).replace(/\n/g, '<br/>' );
  return html;
}

function ResultadoStep({ nome, cartasEscolhidas, respostaIA, gerarRespostaIA, loading, creditos, handleJogar, spreadType, spreads, prefersReducedMotion }) {
  const spreadConfig = spreads.find(s => s.id === spreadType);
  const loadingMessages = [
    'Conectando às cartas…',
    'Lendo energias sutis…',
    'Interpretando símbolos…',
    'Consultando a intuição…',
    'Finalizando a visão…'
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadingMsgIndex(0); return; }
    const id = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1600);
    return () => clearInterval(id);
  }, [loading, loadingMessages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 md:bg-white/15 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center border border-white/40"
    >
      <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">
        {nome}, esta é sua leitura:
      </h2>

      <p className="text-white/90 mb-4 text-center drop-shadow-md">
        {spreadConfig.name} - {spreadConfig.desc}
      </p>

      {/* Cartas escolhidas */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {cartasEscolhidas.map((carta, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="text-center"
          >
            <motion.img
              src={carta.img}
              alt={carta.name}
              className="w-24 h-auto rounded-lg shadow-md border border-white mb-2 bg-white"
              initial={{ rotateY: 180 }}
              animate={prefersReducedMotion ? {} : { rotateY: 0 }}
              transition={{ duration: 1, delay: idx * 0.3 }}
              loading="lazy"
            />
            <p className="text-white font-semibold text-sm drop-shadow-lg">{carta.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Botão para gerar resposta (IA) */}
      {(!respostaIA && creditos > 0) && (
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={gerarRespostaIA}
          className={`mt-2 px-8 py-3 rounded-lg font-bold text-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading 
              ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
              : "bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition focus:ring-yellow-300"
          }`}
          disabled={loading}
        >
          {loading ? `🔮 ${loadingMessages[loadingMsgIndex]}` : "✨ Interpretar"}
        </motion.button>
      )}

      {loading && (
        <div aria-live="polite" className="mt-2 text-white/80 text-sm">
          Aguarde, preparando sua interpretação…
        </div>
      )}

      {/* Exibe a resposta gerada pela IA */}
      {respostaIA && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white/10 backdrop-blur-sm text-white p-6 rounded-lg border border-white/40 max-h-96 overflow-y-auto shadow-lg"
         >
           <div className="drop-shadow-sm" dangerouslySetInnerHTML={{ __html: formatAITextBasic(respostaIA) }} />
         </motion.div>
      )}

      {/* Botão de Jogar Novamente */}
      {respostaIA && creditos > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleJogar}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
        >
          🔄 Jogar Novamente
        </motion.button>
      )}

      {/* Botão de Comprar Créditos */}
      {creditos <= 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => alert('Redirecione para tela de pagamento!')}
          className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
        >
          💳 Comprar créditos
        </motion.button>
      )}
    </motion.div>
  );
}