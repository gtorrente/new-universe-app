// Página do Diário do app Universo Catia
// Permite registrar sentimentos, pensamentos e experiências do dia com interface acolhedora

import { useState, useEffect } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { FaRegSmile, FaRegMeh, FaRegSadTear, FaRegAngry, FaRegMoon } from 'react-icons/fa';
import { BsPencil } from 'react-icons/bs';

// Configuração dos emojis de humor disponíveis
const emojis = [
  { icon: <FaRegSmile className="text-yellow-400 text-2xl" />, label: "Feliz", emoji: "😄" },
  { icon: <FaRegMeh className="text-gray-400 text-2xl" />, label: "Neutro", emoji: "😐" },
  { icon: <FaRegSadTear className="text-blue-400 text-2xl" />, label: "Triste", emoji: "😢" },
  { icon: <FaRegAngry className="text-red-400 text-2xl" />, label: "Irritado", emoji: "😠" },
  { icon: <FaRegMoon className="text-purple-400 text-2xl" />, label: "Cansado", emoji: "😴" },
];

// Inspiração do dia (pode ser dinâmica no futuro)
const inspiracao = "Hoje é um bom dia pra se escutar com carinho.";

// Função para formatar data em português
function formatarData(data) {
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default function Diario() {
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  
  // Estados do diário
  const [humor, setHumor] = useState(null);
  const [fraseCatia, setFraseCatia] = useState("");
  const [texto, setTexto] = useState("");
  const [entradas, setEntradas] = useState([]); // Array de entradas: [{data, humor, texto}]
  const [salvo, setSalvo] = useState(false);
  const [verEntrada, setVerEntrada] = useState(null); // Entrada selecionada para visualizar

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

  // Função para selecionar humor do dia
  function handleSelecionarHumor(idx) {
    setHumor(idx);
    setFraseCatia("Todo sentimento é válido. Obrigada por dividir ❤️");
  }

  // Função para salvar entrada no diário
  function handleSalvar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    
    // Cria nova entrada com data atual
    const novaEntrada = {
      data: new Date(),
      humor: humor !== null ? humor : null,
      texto: texto.trim(),
    };
    
    // Adiciona entrada no início da lista
    setEntradas([novaEntrada, ...entradas]);
    
    // Limpa formulário
    setTexto("");
    setHumor(null);
    setFraseCatia("");
    
    // Mostra feedback de sucesso
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Header global com usuário e créditos */}
      <Header user={user} creditos={creditos} />
      
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header customizado da página */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✍️</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 font-neue-bold tracking-tight">Meu Diário</h1>
          </div>
          <div className="text-base sm:text-lg text-purple-500 font-neue text-center max-w-xl">
            Escreva sobre o seu dia, seus sentimentos ou o que quiser guardar só pra você.
          </div>
        </div>

        {/* Seção de seleção de humor do dia */}
        <div className="bg-white/80 rounded-2xl shadow p-5 flex flex-col items-center gap-2 border-l-4 border-purple-200">
          <div className="text-base font-semibold text-purple-700 mb-1 font-neue-bold">Como você está se sentindo hoje?</div>
          {/* Grid de emojis de humor */}
          <div className="flex gap-3 mb-1">
            {emojis.map((e, idx) => (
              <button
                key={e.emoji}
                onClick={() => handleSelecionarHumor(idx)}
                className={`text-2xl p-2 rounded-full border-2 transition ${humor === idx ? 'border-purple-500 bg-purple-100' : 'border-transparent hover:bg-purple-50'}`}
                aria-label={e.label}
              >
                {e.emoji}
              </button>
            ))}
          </div>
          {/* Mensagem da CatIA quando humor é selecionado */}
          {humor !== null && (
            <div className="text-sm text-purple-500 mt-1 animate-fade-in font-neue">{fraseCatia}</div>
          )}
        </div>

        {/* Seção de inspiração do dia */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-purple-600 text-base font-semibold italic mb-1 bg-white/70 rounded-xl px-4 py-2 shadow-sm font-neue">
            {inspiracao}
          </div>
        </div>

        {/* Seção de entrada de texto do diário */}
        <form onSubmit={handleSalvar} className="flex flex-col gap-3">
          {/* Campo de texto expansível */}
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escreva aqui tudo o que quiser lembrar, desabafar ou registrar…"
            rows={4}
            className="w-full rounded-2xl border border-purple-200 bg-white/90 shadow p-4 text-gray-800 font-neue resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            style={{ minHeight: 80, maxHeight: 200 }}
          />
          {/* Botão de salvar */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-lg bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition font-neue-bold"
          >
            Salvar entrada
          </button>
          {/* Feedback de sucesso */}
          {salvo && (
            <div className="text-green-600 text-center mt-2 animate-fade-in font-neue">Seu diário foi guardado com carinho ✨</div>
          )}
        </form>

        {/* Seção de entradas anteriores */}
        <div className="mt-4">
          <div className="text-lg font-bold text-purple-700 mb-2 flex items-center gap-2 font-neue-bold"><BsPencil className="text-purple-400" /> Minhas Anotações</div>
          {/* Mensagem quando não há entradas */}
          {entradas.length === 0 && (
            <div className="text-gray-400 text-center italic font-neue">Nenhuma anotação ainda. Que tal começar hoje?</div>
          )}
          {/* Lista de entradas anteriores */}
          <div className="flex flex-col gap-3">
            {entradas.map((e, idx) => (
              <button
                key={idx}
                onClick={() => setVerEntrada(e)}
                className="bg-white/80 rounded-xl shadow p-4 flex items-center gap-3 border-l-4 border-purple-200 hover:bg-purple-100 transition text-left"
              >
                <span className="text-2xl">{e.humor !== null ? emojis[e.humor].emoji : "💭"}</span>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1 font-neue">{formatarData(e.data)}</span>
                  <span className="text-gray-700 font-neue text-base truncate max-w-[200px]">{e.texto.split(" ").slice(0, 10).join(" ")}{e.texto.split(" ").length > 10 ? '...' : ''}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal para visualizar entrada completa */}
        {verEntrada && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full flex flex-col gap-4 relative">
              {/* Botão de fechar */}
              <button onClick={() => setVerEntrada(null)} className="absolute top-2 right-2 text-purple-500 hover:text-purple-700 text-lg">×</button>
              {/* Cabeçalho da entrada */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{verEntrada.humor !== null ? emojis[verEntrada.humor].emoji : "💭"}</span>
                <span className="text-sm text-gray-500 font-neue">{formatarData(verEntrada.data)}</span>
              </div>
              {/* Conteúdo da entrada */}
              <div className="text-gray-800 text-base whitespace-pre-line font-neue">{verEntrada.texto}</div>
            </div>
          </div>
        )}

        {/* Rodapé de privacidade */}
        <div className="text-xs text-gray-400 text-center mt-8 mb-2 select-none font-neue">
          Esse espaço é só seu. Tudo o que você escreve aqui é privado.
        </div>
      </div>
    </div>
  );
} 