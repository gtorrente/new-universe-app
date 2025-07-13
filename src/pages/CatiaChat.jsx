// Página de Chat com a CatIA do app Universo Catia
// Interface de conversa com IA assistente, com sugestões de perguntas e respostas simuladas

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlineSend } from "react-icons/ai";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";

// Sugestões de perguntas para facilitar a interação
const sugestoes = [
  "Preciso de um conselho para começar o dia melhor.",
  "Tô me sentindo pra baixo… o que você me diria?",
  "Me sugere uma receita fácil com o que tenho em casa?",
  "Dá pra fazer um jantar gostoso com pouco tempo?"
];

export default function CatiaChat() {
  // Estado das mensagens do chat
  const [mensagens, setMensagens] = useState([
    { autor: "catia", texto: "Eu sou a CatIA 🤖✨ Como posso te ajudar hoje?" }
  ]);
  
  // Estado do campo de input
  const [input, setInput] = useState("");
  
  // Referência para o container de mensagens (para scroll automático)
  const chatRef = useRef(null);
  
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);

  // Efeito para buscar usuário autenticado e créditos no Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setCreditos(userSnap.data().creditos || 0);
        else setCreditos(0);
      } else {
        setCreditos(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Efeito para scroll automático para a última mensagem
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Função para enviar mensagem (do input ou sugestão)
  function enviarMensagem(e, textoSugestao) {
    if (e) e.preventDefault();
    const texto = textoSugestao !== undefined ? textoSugestao : input.trim();
    if (!texto) return;
    
    // Adiciona mensagem do usuário e resposta da CatIA
    setMensagens(msgs => [
      ...msgs,
      { autor: "usuario", texto },
      { autor: "catia", texto: gerarRespostaCatia(texto) }
    ]);
    setInput("");
  }

  // Função para gerar resposta simulada da CatIA
  function gerarRespostaCatia(pergunta) {
    // Respostas baseadas em palavras-chave na pergunta
    if (pergunta.toLowerCase().includes("oi")) return "Oi! 😊 Como posso te ajudar?";
    if (pergunta.toLowerCase().includes("mapa astral")) return "Posso te ajudar a interpretar seu mapa astral! Me envie sua dúvida.";
    if (pergunta.toLowerCase().includes("receita")) return "Que tal um omelete rápido? Me diga os ingredientes que você tem!";
    if (pergunta.toLowerCase().includes("jantar")) return "Uma massa com molho de tomate e queijo fica pronta em 15 minutos! Quer a receita?";
    if (pergunta.toLowerCase().includes("conselho")) return "Respire fundo, confie em você e lembre-se: todo dia é uma nova chance!";
    if (pergunta.toLowerCase().includes("baixo")) return "Sinta-se abraçado! Tudo passa, e você é mais forte do que imagina.";
    return "Que interessante! Me conte mais ou faça outra pergunta.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Header global com usuário e créditos */}
      <Header user={user} creditos={creditos} />
      
      <div className="flex flex-col items-center w-full">
        {/* Container principal do chat */}
        <div className="flex flex-col w-full flex-1 h-full relative">
          {/* Seção de sugestões de perguntas */}
          <div className="flex flex-wrap gap-2 px-4 pt-2 pb-1 justify-center sticky top-0 z-10 bg-gradient-to-br from-purple-100 to-blue-100/80">
            {sugestoes.map((s, i) => (
              <button
                key={i}
                onClick={() => enviarMensagem(null, s)}
                className="px-3 py-2 rounded-xl bg-white/80 text-purple-700 font-medium text-sm shadow hover:bg-purple-100 transition border border-purple-200"
              >
                {s}
              </button>
            ))}
          </div>
          
          {/* Área de mensagens com scroll automático */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
            style={{ marginBottom: '80px' }}
          >
            {mensagens.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow font-sans text-base ${msg.autor === "catia"
                  ? "bg-purple-100 text-purple-800 self-start"
                  : "bg-blue-500 text-white self-end ml-auto"}`}
              >
                {msg.texto}
              </motion.div>
            ))}
          </div>
          
          {/* Campo de input fixo acima do menu inferior */}
          <form
            onSubmit={enviarMensagem}
            className="flex items-center gap-2 px-4 py-4 bg-white/90 fixed bottom-16 left-0 w-full z-20 border-t border-purple-100"
            style={{ boxShadow: '0 -2px 16px 0 rgba(80,0,120,0.04)' }}
          >
            {/* Campo de texto para digitar mensagem */}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800 font-sans"
              autoFocus
            />
            {/* Botão de enviar */}
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow transition"
            >
              <AiOutlineSend size={22} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 