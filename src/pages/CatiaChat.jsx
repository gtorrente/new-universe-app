// Página de Chat com a CatIA do app Universo Catia

import { useState, useRef, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

// Sugestões de perguntas para facilitar a interação
const sugestoes = [
  "Preciso de um conselho para começar o dia melhor.",
  "Tô me sentindo pra baixo… o que você me diria?",
  "Me sugere uma receita fácil com o que tenho em casa?",
  "Dá pra fazer um jantar gostoso com pouco tempo?"
];

// ✅ URL correta do webhook no n8n
const N8N_WEBHOOK_URL = "https://torrente.app.n8n.cloud/webhook/chat-catia";

export default function CatiaChat() {
  const [mensagens, setMensagens] = useState([
    { autor: "catia", texto: "Eu sou a CatIA 🤖✨ Como posso te ajudar hoje?" }
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Recupera usuário e créditos do Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        setCreditos(userSnap.exists() ? userSnap.data().creditos || 0 : 0);
      } else {
        setCreditos(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll automático para o fim da conversa
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens, isTyping]);

  // Envia mensagem do usuário e recebe resposta da CatIA
  async function enviarMensagem(e, textoSugestao) {
    if (e) e.preventDefault();
    const texto = textoSugestao !== undefined ? textoSugestao : input.trim();
    if (!texto) return;

    setMensagens(msgs => [...msgs, { autor: "usuario", texto }]);
    setInput("");
    setIsTyping(true); // Inicia indicador de digitação

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto })
      });

      console.log("Status:", response.status);
      const text = await response.text();
      console.log("Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
        console.log("Data parsed:", data);
      } catch (parseErr) {
        console.error("Erro ao fazer JSON.parse:", parseErr);
        setMensagens(msgs => [
          ...msgs,
          { autor: "catia", texto: "Erro ao interpretar resposta da IA." }
        ]);
        setIsTyping(false); // Para indicador em caso de erro
        return;
      }

      setMensagens(msgs => [
        ...msgs,
        { autor: "catia", texto: data.message?.content || "Desculpe, não consegui responder agora." }
      ]);
      setIsTyping(false); // Para indicador ao receber resposta
      // Vibração ao receber resposta
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error("Erro no fetch:", err);
      setMensagens(msgs => [
        ...msgs,
        { autor: "catia", texto: "Erro ao conectar com a IA. Tente novamente." }
      ]);
      setIsTyping(false); // Para indicador em caso de erro
    }  
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Header user={user} creditos={creditos} />
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col w-full flex-1 h-full relative">
          {mensagens.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 pt-2 pb-1 justify-center sticky top-0 z-10 bg-gradient-to-br from-purple-100 to-blue-100/80">
              {sugestoes.map((s, i) => (
                <button
                  key={i}
                  onClick={() => enviarMensagem(null, s)}
                  className={`px-3 py-2 rounded-xl bg-white/80 text-purple-700 font-medium text-sm shadow hover:bg-purple-100 transition border border-purple-200 ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isTyping}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
            style={{ marginBottom: '80px' }}
          >
            {mensagens.map((msg, idx) => (
              msg.autor === "catia" ? (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-[80%] rounded-2xl px-4 py-3 shadow font-sans text-base bg-purple-100 text-purple-800 self-start"
                >
                  {msg.texto}
                </motion.div>
              ) : (
                <div
                  key={idx}
                  className="max-w-[80%] rounded-2xl px-4 py-3 shadow font-sans text-base bg-blue-500 text-white self-end ml-auto"
                >
                  {msg.texto}
                </div>
              )
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 mt-2 animate-pulse">
                <span className="text-purple-500 font-medium">CatIA está digitando</span>
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                <span className="inline-block w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-150"></span>
                <span className="inline-block w-2 h-2 bg-purple-200 rounded-full animate-bounce delay-300"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={enviarMensagem}
            className="flex items-center gap-2 px-4 py-4 bg-white/90 fixed bottom-16 left-0 w-full z-20 border-t border-purple-100"
            style={{ boxShadow: '0 -2px 16px 0 rgba(80,0,120,0.04)' }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800 font-sans"
              autoFocus
              disabled={isTyping}
            />
            <button
              type="submit"
              className={`bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow transition ${isTyping || !input.trim() ? 'opacity-50 cursor-not-allowed bg-purple-300 hover:bg-purple-300' : ''}`}
              disabled={isTyping || !input.trim()}
            >
              <AiOutlineSend size={22} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
