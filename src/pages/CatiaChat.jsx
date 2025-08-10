// Página de Chat com a CatIA do app Universo Catia

import { useState, useRef, useEffect, useCallback } from "react";
import { AiOutlineSend } from "react-icons/ai";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Sugestões de perguntas para facilitar a interação
const sugestoes = [
  "Preciso de um conselho para começar o dia melhor.",
  "Tô me sentindo pra baixo… o que você me diria?",
  "Me sugere uma receita fácil com o que tenho em casa?",
  "Dá pra fazer um jantar gostoso com pouco tempo?"
];

// ✅ URL correta do webhook no n8n
const N8N_WEBHOOK_URL = "https://universocatia.app.n8n.cloud/webhook/chat-catia";

// Função para formatar respostas da CatIA
const formatarResposta = (texto) => {
  // Detectar se é uma receita (mais preciso)
  const isReceita = texto.includes('**Ingredientes:**') || 
                    texto.includes('**Modo de Preparo:**') ||
                    texto.includes('**Modo de preparo:**') ||
                    (texto.includes('Ingredientes') && texto.includes('Preparo')) ||
                    (texto.includes('ingredientes') && texto.includes('preparo')) ||
                    // Detectar também por contexto de receita
                    (texto.includes('minutinhos') && (texto.includes('cozinhe') || texto.includes('tempere')));

  if (isReceita) {
    return formatarReceita(texto);
  }

  // Formatação geral para outras respostas (com negrito)
  return formatarTextoGeral(texto);
};

// Função para formatar receitas
const formatarReceita = (texto) => {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  const blocos = [];
  let blocoAtual = { tipo: 'texto', conteudo: '' };

  partes.forEach(parte => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      // Verificar se é um título de seção (Ingredientes, Modo de Preparo, etc.)
      const titulo = parte.replace(/\*\*/g, '');
      const isSecaoTitle = titulo.toLowerCase().includes('ingredientes') || 
                          titulo.toLowerCase().includes('modo de preparo') ||
                          titulo.toLowerCase().includes('preparo') ||
                          titulo.toLowerCase().includes('receita');
      
      if (isSecaoTitle) {
        // É um título de seção
        if (blocoAtual.conteudo.trim()) {
          blocos.push(blocoAtual);
        }
        
        blocoAtual = { 
          tipo: 'titulo', 
          conteudo: titulo,
          icone: getTituloIcon(titulo)
        };
        blocos.push(blocoAtual);
        blocoAtual = { tipo: 'conteudo', conteudo: '' };
      } else {
        // É apenas texto em negrito, adicionar ao conteúdo atual
        blocoAtual.conteudo += parte;
      }
    } else {
      blocoAtual.conteudo += parte;
    }
  });

  if (blocoAtual.conteudo.trim()) {
    blocos.push(blocoAtual);
  }

  return blocos;
};

// Função para formatar texto geral
const formatarTextoGeral = (texto) => {
  return [{ tipo: 'texto-simples', conteudo: texto }];
};

// Função para obter ícones baseados no título
const getTituloIcon = (titulo) => {
  const tituloLower = titulo.toLowerCase();
  if (tituloLower.includes('ingredientes')) return '🥗';
  if (tituloLower.includes('preparo') || tituloLower.includes('modo')) return '👩‍🍳';
  if (tituloLower.includes('receita') || titulo.toLowerCase().includes('prato')) return '🍽️';
  return '✨';
};

// Função para formatar texto com negrito
const formatarTextoComNegrito = (texto) => {
  // Dividir o texto por **palavra** para criar elementos em negrito
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  
  return partes.map((parte, idx) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      // É um texto em negrito
      const textoNegrito = parte.replace(/\*\*/g, '');
      return (
        <strong key={idx} className="font-bold text-purple-900">
          {textoNegrito}
        </strong>
      );
    }
    return parte;
  });
};

// Componente para renderizar blocos formatados
const BlocoFormatado = ({ bloco }) => {
  if (bloco.tipo === 'titulo') {
    return (
      <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
          <span className="text-white text-lg">{bloco.icone}</span>
        </div>
        <h3 className="font-bold text-purple-900 text-xl">{bloco.conteudo}</h3>
      </div>
    );
  }

  if (bloco.tipo === 'conteudo') {
    const linhas = bloco.conteudo.trim().split('\n').filter(linha => linha.trim());
    
    return (
      <div className="mb-6">
        {linhas.map((linha, idx) => {
          const linhaLimpa = linha.trim();
          if (!linhaLimpa) return null;
          
          // Detectar tempo de preparo
          if (linhaLimpa.includes('minutos') || linhaLimpa.includes('horas')) {
            return (
              <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-3 mb-3 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">⏱️</span>
                  <span className="text-green-800 font-medium">
                    {formatarTextoComNegrito(linhaLimpa)}
                  </span>
                </div>
              </div>
            ); 
          }
          
          // Se a linha parece ser um item de lista (começa com número ou traço)
          if (/^\d+\./.test(linhaLimpa) || linhaLimpa.startsWith('-')) {
            const textoSemMarcador = linhaLimpa.replace(/^\d+\.\s*|-\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-3 mb-3 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full mt-0.5">
                  <span className="text-purple-600 font-bold text-xs">•</span>
                </div>
                <span className="text-purple-800 leading-relaxed flex-1">
                  {formatarTextoComNegrito(textoSemMarcador)}
                </span>
              </div>
            );
          }
          
          return (
            <p key={idx} className="text-purple-800 leading-relaxed mb-3">
              {formatarTextoComNegrito(linhaLimpa)}
            </p>
          );
        })}
      </div>
    );
  }

  if (bloco.tipo === 'texto-simples') {
    // Para texto geral (não receitas), aplicar formatação com negrito
    return (
      <div className="text-purple-800 leading-relaxed">
        {formatarTextoComNegrito(bloco.conteudo)}
      </div>
    );
  }

  return (
    <div className="text-purple-800 leading-relaxed whitespace-pre-wrap">
      {formatarTextoComNegrito(bloco.conteudo)}
    </div>
  );
};

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
  const [conversaIniciada, setConversaIniciada] = useState(false);


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

    // Bloqueia envio se não estiver autenticado
    if (!user?.uid) {
      alert("Faça login para usar o chat!");
      return;
    }

    setMensagens(msgs => [...msgs, { autor: "usuario", texto }]);
    setInput("");
    setIsTyping(true); // Inicia indicador de digitação
    
    // Marcar que a conversa foi iniciada
    if (!conversaIniciada) {
      setConversaIniciada(true);
    }

    // Log para depuração
    console.log("Enviando para N8N:", {
      pergunta: texto,
      userId: user?.uid
    });

    try {

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: texto,
          userId: user?.uid || "anonimo"
        })
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
         // ✅ Resposta do N8N (agora com memória nativa)
    if (data && data.output) {
        setMensagens(msgs => [
          ...msgs,
          { autor: "catia", texto: data.output }
        ]);
        setIsTyping(false);
        
        // Vibração ao receber resposta
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
      } else {
        setMensagens(msgs => [
          ...msgs,
          { autor: "catia", texto: "Desculpe, não consegui responder agora." }
        ]);
        setIsTyping(false);
      }



    //   setMensagens(msgs => [
    //     ...msgs,
    //     { autor: "catia", texto: data.message?.content || "Desculpe, não consegui responder agora." }
    //   ]);
    //   setIsTyping(false); // Para indicador ao receber resposta
    //   // Vibração ao receber resposta
    //   if ("vibrate" in navigator) {
    //     navigator.vibrate(50);
    //   }
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
          {/* Sugestões de perguntas (apenas quando conversa nova) */}
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
                <div
                  key={idx}
                  className="max-w-[90%] rounded-2xl px-6 py-5 shadow-lg font-sans bg-white border border-purple-100 self-start"
                >
                  {formatarResposta(msg.texto).map((bloco, blocoIdx) => (
                    <BlocoFormatado key={blocoIdx} bloco={bloco} />
                  ))}
                </div>
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
