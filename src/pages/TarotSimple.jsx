// Versão simplificada do Tarot para teste
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { db, addDoc, collection, auth } from "../firebaseConfigFront";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Dados de cartas simples para teste
const cartasSimples = [
  { name: "O Louco", img: "/cards/m00.jpg", description: "Novos começos e aventuras" },
  { name: "O Mago", img: "/cards/m01.jpg", description: "Poder pessoal e manifestação" },
  { name: "A Sacerdotisa", img: "/cards/m02.jpg", description: "Intuição e sabedoria interior" }
];

export default function TarotSimple() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [cartaEscolhida, setCartaEscolhida] = useState(null);
  const [respostaIA, setRespostaIA] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (user && user.displayName) {
        setNome(user.displayName.split(" ")[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Buscar créditos
  useEffect(() => {
    const buscarCreditos = async () => {
      if (usuario) {
        try {
          const userRef = doc(db, "usuarios", usuario.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setCreditos(userSnap.data().creditos || 0);
          }
        } catch (error) {
          console.error("Erro ao buscar créditos:", error);
        }
      }
    };
    buscarCreditos();
  }, [usuario]);

  const escolherCarta = () => {
    const cartaAleatoria = cartasSimples[Math.floor(Math.random() * cartasSimples.length)];
    setCartaEscolhida(cartaAleatoria);
    setStep(3);
  };

  const gerarResposta = async () => {
    if (!API_KEY || !cartaEscolhida) {
      setRespostaIA("Erro: Configuração incompleta");
      return;
    }

    setLoading(true);
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
            { role: "user", content: `Pergunta: "${pergunta}"\nCarta: ${cartaEscolhida.name}\nSignificado: ${cartaEscolhida.description}\nGere uma resposta curta e significativa.` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`Erro da API: ${response.status}`);
      
      const data = await response.json();
      const resposta = data.choices[0].message.content.trim();
      setRespostaIA(resposta);

      // Salvar no Firebase
      await addDoc(collection(db, "leituras_tarot"), {
        userId: usuario.uid,
        nome,
        pergunta,
        carta: cartaEscolhida.name,
        resposta,
        timestamp: new Date()
      });

      // Descontar crédito
      await setDoc(doc(db, "usuarios", usuario.uid), { 
        creditos: creditos - 1
      }, { merge: true });
      
      setCreditos(prev => prev - 1);
    } catch (error) {
      console.error("Erro:", error);
      setRespostaIA("Erro ao gerar resposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setStep(1);
    setPergunta("");
    setCartaEscolhida(null);
    setRespostaIA("");
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen">
      <Header user={usuario} creditos={creditos} />
      
      <div className="w-full max-w-xl mx-auto py-8 px-4">
        {/* Etapa 1: Pergunta */}
        {step === 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-purple-700">
                🎴 Tarot Gratuito
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                FREE
              </span>
            </div>
            <p className="text-gray-600 mb-4">Faça sua pergunta com o coração</p>
            
            {/* Banner Premium */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-purple-700 font-semibold mb-1">
                ✨ Quer uma experiência mais completa?
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Premium: Múltiplas cartas, atmosfera imersiva, IA avançada
              </p>
              <button 
                onClick={() => alert('Redirecionar para upgrade premium')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold py-1 px-3 rounded hover:from-purple-700 hover:to-blue-700 transition"
              >
                🚀 Upgrade Premium
              </button>
            </div>
            
            <input
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex.: O que preciso saber sobre minha carreira? Ou: Qual o próximo passo no meu relacionamento?"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-6"
            />
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => pergunta.trim() && setStep(2)}
                disabled={!pergunta.trim() || creditos === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {creditos === 0 ? "Sem créditos" : "Continuar"}
              </button>
            </div>

            {creditos === 0 && (
              <p className="text-red-600 text-sm mt-4">
                Você precisa de créditos para usar o Tarot
              </p>
            )}
          </div>
        )}

        {/* Etapa 2: Escolher carta */}
        {step === 2 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">
              Escolha uma carta
            </h2>
            
            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src="/cards/carta-verso-2.png"
                  alt="Carta"
                  className="w-20 h-auto rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                  onClick={escolherCarta}
                />
              ))}
            </div>
            
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Voltar
            </button>
          </div>
        )}

        {/* Etapa 3: Resultado */}
        {step === 3 && cartaEscolhida && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              {nome}, esta é sua carta:
            </h2>
            
            <img
              src={cartaEscolhida.img}
              alt={cartaEscolhida.name}
              className="w-32 mx-auto rounded-lg shadow-md mb-4"
            />
            
            <h3 className="text-xl font-semibold text-purple-700 mb-2">
              {cartaEscolhida.name}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {cartaEscolhida.description}
            </p>

            {!respostaIA && (
              <button
                onClick={gerarResposta}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition mb-4"
              >
                {loading ? "Gerando..." : "Interpretar"}
              </button>
            )}

            {respostaIA && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-purple-800 italic">{respostaIA}</p>
              </div>
            )}

            {respostaIA && (
              <button
                onClick={reiniciar}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                🔄 Jogar Novamente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}