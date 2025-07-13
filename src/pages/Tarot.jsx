// Página do Tarot do app Universo Catia
// Permite fazer perguntas e receber orientações através de cartas do tarot com interpretação da IA

import { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import cartasData from "../tarot.json";
import { db, addDoc, collection, auth } from "../firebaseConfigFront";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// eslint-disable-next-line
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// Componente principal do Tarot
export default function Tarot() {
  const navigate = useNavigate();
  
  // --- ESTADOS GLOBAIS DO FLUXO ---
  const [usuario, setUsuario] = useState(null); // Usuário autenticado
  const [creditos, setCreditos] = useState(0); // Créditos do usuário
  const [jogouHoje, setJogouHoje] = useState(false); // Controle de jogo diário
  const [step, setStep] = useState(1); // Etapa do fluxo (1: pergunta, 2: embaralhar, 3: escolher, 4: resultado)

  // --- ESTADOS DO JOGO ---
  const [nome, setNome] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [cartas, setCartas] = useState(cartasData.cartas);
  const [cartaEscolhida, setCartaEscolhida] = useState(null);
  const [respostaIA, setRespostaIA] = useState("");
  const [loading, setLoading] = useState(false);

  // Chave da API OpenAI para interpretação das cartas
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // --- AUTENTICAÇÃO: escuta usuário logado e define nome ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (user && user.displayName) {
        setNome(user.displayName.split(" ")[0]);
        setStep(1); // Garante que está na tela de pergunta
      }
    });
    return () => unsubscribe();
  }, []);

  // --- BUSCA CRÉDITOS: sempre que usuario mudar ---
  useEffect(() => {
    const buscarCreditos = async () => {
      if (usuario) {
        const userRef = doc(db, "usuarios", usuario.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setCreditos(userSnap.data().creditos || 0);
        else setCreditos(0);
      } else {
        setCreditos(0);
      }
    };
    buscarCreditos();
  }, [usuario]);

  // --- EMBARALHAR CARTAS ---
  const embaralharCartas = () => {
    setCartas([...cartas].sort(() => Math.random() - 0.5));
    setStep(3);
  };

  // --- JOGAR NOVAMENTE ---
  const handleJogar = async () => {
    setStep(1);
    setJogouHoje(false);
    setCreditos((prev) => prev - 1);
    setPergunta("");
    setRespostaIA("");
    setCartaEscolhida(null);
  };

  // --- GERAR RESPOSTA DA IA ---
  const gerarRespostaIA = async () => {
    // Validação de créditos primeiro
    if (creditos === 0) {
      setRespostaIA("⚠️ Você não possui créditos suficientes para jogar. Adquira mais créditos.");
      return;
    }
    // Validação se já jogou hoje
    if (jogouHoje) {
      setRespostaIA("⚠️ Você já jogou hoje! Para jogar novamente, adquira um novo crédito.");
      return;
    }
    if (!usuario) {
      setRespostaIA("Erro: Usuário não autenticado.");
      return;
    }
    if (!cartaEscolhida || !pergunta) {
      setRespostaIA("⚠️ Digite sua nova pergunta antes de interpretar.");
      return;
    }
    setLoading(true);
    const prompt = `Pergunta: "${pergunta}"\nSignificado da carta: "${cartaEscolhida.description}"\nGere uma resposta curta e significativa, em uma ou duas frases, relacionando a pergunta com o significado da carta.`;
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Você é um leitor de Tarô experiente." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error(`Erro da API: ${response.status}`);
      const data = await response.json();
      const respostaGerada = data.choices[0].message.content.trim();
      setRespostaIA(respostaGerada);
      // Salva a leitura no Firestore
      await addDoc(collection(db, "leituras_tarot"), {
        nome, pergunta,
        carta: cartaEscolhida.name,
        significado: cartaEscolhida.description,
        resposta: respostaGerada,
        timestamp: new Date()
      });
      await setDoc(doc(db, "usuarios", usuario.uid), { ultimoJogo: new Date() }, { merge: true });
      setJogouHoje(true);
    } catch (error) {
      console.error("Erro ao gerar resposta IA:", error);
      setRespostaIA("Algo deu errado ao gerar sua resposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen">
      {/* Header global com usuário e créditos */}
      <Header user={usuario} creditos={creditos} />
      <div className="w-full max-w-xl mx-auto py-8 px-2 space-y-8">
        {/* Etapa 1: Pergunta */}
        {step === 1 && (
          <PerguntaStep pergunta={pergunta} setPergunta={setPergunta} setStep={setStep} navigate={navigate} creditos={creditos} />
        )}
        {/* Etapa 2: Embaralhar */}
        {step === 2 && creditos > 0 && (
          <EmbaralharStep setStep={setStep} embaralharCartas={embaralharCartas} />
        )}
        {/* Etapa 3: Escolha da carta */}
        {step === 3 && creditos > 0 && (
          <EscolherCartaStep cartas={cartas} setCartaEscolhida={setCartaEscolhida} setStep={setStep} />
        )}
        {/* Etapa 4: Resultado */}
        {step === 4 && cartaEscolhida && (
          <ResultadoStep
            nome={nome}
            cartaEscolhida={cartaEscolhida}
            respostaIA={respostaIA}
            gerarRespostaIA={gerarRespostaIA}
            loading={loading}
            creditos={creditos}
            handleJogar={handleJogar}
          />
        )}
      </div>
    </div>
  );
}

// Componente da etapa 1: Pergunta
function PerguntaStep({ pergunta, setPergunta, setStep, navigate, creditos }) {
  const semCreditos = creditos === 0;
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center">
      {/* Título sutil e acolhedor */}
      <h2 className="text-xl font-semibold text-purple-700 mb-2 flex items-center gap-2 font-neue-bold">
        <span role="img" aria-label="balão de pensamento"></span> Vamos ouvir o que o universo tem a dizer?
      </h2>
      {/* Microcopy explicativo */}
      <p className="text-gray-700 text-base mb-1 font-neue items-center">Faça sua pergunta com o coração.</p>
      <p className="text-gray-400 text-sm italic mb-6 font-neue text-center">Exemplo: "O que posso fazer para melhorar minha vida amorosa?"</p>
      {/* Campo de input para a pergunta */}
      <input
        id="pergunta-tarot"
        type="text"
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
        placeholder="Escreva sua pergunta aqui…"
        className="text-gray-800 px-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full max-w-xs mb-8 font-sans placeholder-gray-400"
        disabled={semCreditos}
      />
      {/* Botões de ação */}
      <div className="flex justify-between items-center w-full max-w-xs gap-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-gray-400 font-semibold px-4 py-2 rounded-lg transition hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => !semCreditos && pergunta.trim() !== "" && setStep(2)}
          className={`bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-purple-700 transition font-sans ${semCreditos ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={semCreditos || pergunta.trim() === ""}
        >
          {semCreditos ? "Sem créditos" : "Continuar"}
        </button>
      </div>
      {/* Aviso quando não há créditos */}
      {semCreditos && (
        <div className="mt-4 text-red-600 text-sm font-bold text-center">
          Você não possui créditos suficientes para jogar.<br />
          <button
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            onClick={() => alert('Redirecione para tela de pagamento!')}
          >
            Comprar Créditos
          </button>
        </div>
      )}
    </div>
  );
}

// Componente da etapa 2: Embaralhar cartas
function EmbaralharStep({ setStep, embaralharCartas }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center">
      {/* Dica para o usuário */}
      <div className="mb-6 w-full">
        <p className="text-purple-700 font-semibold mb-2 font-sans">Dica:</p>
        <p className="text-gray-600 text-sm font-sans">Respire fundo e concentre-se na sua pergunta. Você poderá tirar apenas uma carta por dia. Quando sentir que é o momento certo clique em <span className='font-bold text-purple-700'>Embaralhar</span>.</p>
      </div>
      {/* Título com animação */}
      <h2 className="text-2xl font-bold mb-6 text-purple-700 font-sans animate-pulse">Mentalize sua pergunta...</h2>
      {/* Imagem das cartas */}
      <div className="flex items-center justify-center mb-6">
        <img
          src="/cards/carta-verso-2.png"
          alt="Cátia segurando cartas"
          className="w-32 h-auto rounded-xl shadow-lg border border-purple-200"
        />
      </div>
      {/* Botões de navegação */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2 w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep(1)}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-400 transition font-sans"
        >
          Voltar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={embaralharCartas}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-purple-700 transition font-sans"
        >
          Embaralhar
        </motion.button>
      </div>
    </div>
  );
}

// Componente da etapa 3: Escolher carta
function EscolherCartaStep({ cartas, setCartaEscolhida, setStep }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-purple-700 font-sans">Escolha uma carta</h2>
      {/* Grid de cartas para escolha */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {cartas.slice(0, 12).map((carta, idx) => (
          <motion.img
            key={idx}
            src="/cards/carta-verso-2.png"
            alt="Verso da carta"
            className="w-20 h-auto rounded-lg shadow-md border border-gray-200 cursor-pointer hover:scale-110 transition-transform bg-white/80"
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setCartaEscolhida(carta);
              setStep(4);
            }}
          />
        ))}
      </div>
      {/* Botão para voltar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setStep(2)}
        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-400 transition font-sans"
      >
        Voltar
      </motion.button>
    </div>
  );
}

// Componente da etapa 4: Resultado da leitura
function ResultadoStep({ nome, cartaEscolhida, respostaIA, gerarRespostaIA, loading, creditos, handleJogar }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center">
      {/* Saudação personalizada */}
      <h2 className="text-2xl font-bold mb-4 text-purple-700 font-sans">{nome}, esta é a sua carta:</h2>
      {/* Imagem da carta escolhida com animação */}
      <motion.img
        src={cartaEscolhida.img}
        alt={cartaEscolhida.nome}
        className="w-32 mx-auto rounded-lg shadow-md border border-purple-200 mb-4 bg-white/80"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 1 }}
      />
      {/* Nome e descrição da carta */}
      <h3 className="text-xl font-semibold mt-2 mb-4 text-purple-700 font-sans">{cartaEscolhida.name}</h3>
      <p className="text-base italic text-gray-600 mb-4 font-sans">{cartaEscolhida.description}</p>
      
      {/* Botão para gerar resposta (IA) */}
      {(!respostaIA && creditos > 0) && (
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={gerarRespostaIA}
          className={`mt-2 px-8 py-3 rounded-lg font-bold text-lg font-sans shadow ${loading ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600 transition"}`}
          disabled={loading}
        >
          {loading ? "Lendo o seu futuro..." : "Interpretar"}
        </motion.button>
      )}
      
      {/* Exibe a resposta gerada pela IA */}
      {respostaIA && (
        <p className="mt-4 bg-purple-50 text-purple-800 p-4 rounded-lg italic font-sans shadow-inner border border-purple-200">{respostaIA}</p>
      )}
      
      {/* Botão de Jogar Novamente */}
      {respostaIA && creditos > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={async () => {
            handleJogar();
          }}
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-red-600 transition font-sans"
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
          className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-600 transition font-sans"
        >
          💳 Comprar créditos
        </motion.button>
      )}
    </div>
  );
}