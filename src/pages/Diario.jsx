// Página do Diário do app Universo Catia
// Permite registrar sentimentos, pensamentos e experiências do dia com interface acolhedora

import { useState, useEffect } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc, collection, addDoc, query, onSnapshot, where, deleteDoc } from "firebase/firestore";
import { FaRegSmile, FaRegMeh, FaRegSadTear, FaRegAngry, FaRegMoon } from 'react-icons/fa';
import { BsPencil, BsTrash3 } from 'react-icons/bs';

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

  const [verEntrada, setVerEntrada] = useState(null); // Entrada selecionada para visualizar
  const [loading, setLoading] = useState(false);
  const [loadingEntradas, setLoadingEntradas] = useState(true);
  const [entradaParaDeletar, setEntradaParaDeletar] = useState(null); // Entrada sendo deletada
  const [confirmandoDelete, setConfirmandoDelete] = useState(false);
  const [deletando, setDeletando] = useState(false);

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

  // Efeito para carregar entradas do diário do usuário
  useEffect(() => {
    if (!user) {
      console.log("❌ Usuário não autenticado, limpando entradas");
      setEntradas([]);
      setLoadingEntradas(false);
      return;
    }

    console.log("✅ Usuário autenticado, carregando entradas para:", user.uid);
    setLoadingEntradas(true);
    
    // Query para buscar entradas do diário do usuário ordenadas por data (mais recentes primeiro)
    // Removendo orderBy temporariamente para testar se é problema de índice
    const entradasQuery = query(
      collection(db, "diario"),
      where("userId", "==", user.uid)
    );

    console.log("🔍 Executando query para userId:", user.uid);

    // Listener em tempo real para entradas do diário
    const unsubscribe = onSnapshot(entradasQuery, (snapshot) => {
      try {
        const entradasData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Verificar se os dados estão válidos
          if (data && data.dataCreated && data.texto) {
            entradasData.push({
              id: doc.id,
              userId: data.userId,
              texto: data.texto,
              humor: data.humor,
              data: data.dataCreated.toDate(), // Converter Timestamp para Date
              isTemporary: false, // Marcar como entrada salva
            });
          }
        });
        
        // Combinar entradas do Firebase com entradas temporárias existentes
        setEntradas(prevEntradas => {
          // Se não há entradas anteriores (página recarregada), usar apenas dados do Firebase
          if (!prevEntradas || prevEntradas.length === 0) {
            console.log("📝 Carregando", entradasData.length, "entradas do Firebase");
            // Ordenar por data (mais recentes primeiro)
            return entradasData.sort((a, b) => b.data.getTime() - a.data.getTime());
          }
          
          // Filtrar apenas entradas temporárias ainda válidas
          const temporarias = prevEntradas.filter(e => e.isTemporary);
          
          if (temporarias.length === 0) {
            // Se não há temporárias, usar apenas dados do Firebase
            return entradasData.sort((a, b) => b.data.getTime() - a.data.getTime());
          }
          
          // Verificar se existe entrada do Firebase correspondente às temporárias
          const temporariasValidadas = temporarias.filter(temp => {
            return !entradasData.some(real => 
              Math.abs(real.data.getTime() - temp.data.getTime()) < 5000 && 
              real.texto === temp.texto
            );
          });
          
          // Combinar e ordenar por data (mais recentes primeiro)
          const todasEntradas = [...temporariasValidadas, ...entradasData];
          return todasEntradas.sort((a, b) => b.data.getTime() - a.data.getTime());
        });
        
        setLoadingEntradas(false);
      } catch (error) {
        console.error("Erro ao processar entradas do diário:", error);
        setLoadingEntradas(false);
      }
    }, (error) => {
      console.error("Erro ao carregar entradas do diário:", error);
      setLoadingEntradas(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Função para selecionar humor do dia
  function handleSelecionarHumor(idx) {
    setHumor(idx);
    setFraseCatia("Todo sentimento é válido. Obrigada por dividir ❤️");
  }

  // Função para iniciar processo de deletar entrada
  function handleIniciarDelete(entrada, e) {
    e.stopPropagation(); // Evita abrir modal de visualização
    setEntradaParaDeletar(entrada);
    setConfirmandoDelete(true);
  }

  // Função para cancelar deleção
  function handleCancelarDelete() {
    setEntradaParaDeletar(null);
    setConfirmandoDelete(false);
  }

  // Função para confirmar e executar deleção
  async function handleConfirmarDelete() {
    if (!entradaParaDeletar || !user) return;
    
    setDeletando(true);
    console.log("🗑️ Deletando entrada:", entradaParaDeletar.id, "temporária:", entradaParaDeletar.isTemporary);
    
    try {
      // Se for entrada temporária, apenas remove da lista
      if (entradaParaDeletar.isTemporary) {
        console.log("🗑️ Removendo entrada temporária da lista");
        setEntradas(prev => prev.filter(e => e.id !== entradaParaDeletar.id));
      } else {
        console.log("🗑️ Deletando entrada do Firebase:", entradaParaDeletar.id);
        
        // Remoção otimista: remove da lista imediatamente
        setEntradas(prev => prev.filter(e => e.id !== entradaParaDeletar.id));
        
        // Deleta do Firebase - o listener vai sincronizar automaticamente
        await deleteDoc(doc(db, "diario", entradaParaDeletar.id));
        console.log("✅ Entrada deletada do Firebase com sucesso");
      }
      
      // Fechar modais
      setConfirmandoDelete(false);
      setEntradaParaDeletar(null);
      
    } catch (error) {
      console.error("❌ Erro ao deletar entrada:", error);
      
      // Se houve erro, vamos recarregar as entradas para restaurar o estado
      if (!entradaParaDeletar.isTemporary) {
        console.log("🔄 Erro ao deletar, estados podem estar inconsistentes");
      }
      
      alert("Erro ao deletar entrada. Tente novamente.");
    } finally {
      setDeletando(false);
    }
  }

  // Função para salvar entrada no diário
  async function handleSalvar(e) {
    e.preventDefault();
    if (!texto.trim() || !user) return;
    
    setLoading(true);
    
    // Criar entrada temporária para mostrar imediatamente
    const entradaTemporaria = {
      id: `temp-${Date.now()}`, // ID temporário único
      userId: user.uid,
      texto: texto.trim(),
      humor: humor !== null ? humor : null,
      data: new Date(),
      isTemporary: true, // Flag para identificar entrada temporária
    };
    
    // Adicionar imediatamente na lista (atualização otimista)
    setEntradas([entradaTemporaria, ...entradas]);
    
    // Limpar formulário imediatamente
    const textoSalvo = texto.trim();
    const humorSalvo = humor;
    setTexto("");
    setHumor(null);
    setFraseCatia("");
    
    try {
      // Criar documento no Firestore
      const novaEntrada = {
        userId: user.uid,
        texto: textoSalvo,
        humor: humorSalvo !== null ? humorSalvo : null,
        dataCreated: new Date(),
      };
      
      await addDoc(collection(db, "diario"), novaEntrada);
      
    } catch (error) {
      console.error("Erro ao salvar entrada do diário:", error);
      
      // Remover entrada temporária em caso de erro
      setEntradas(entradas.filter(e => e.id !== entradaTemporaria.id));
      
      // Restaurar formulário
      setTexto(textoSalvo);
      setHumor(humorSalvo);
      
      alert("Erro ao salvar entrada. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
            disabled={loading || !texto.trim()}
            className="w-full py-3 rounded-xl font-bold text-lg bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition font-neue-bold disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar entrada"}
          </button>

        </form>

        {/* Seção de entradas anteriores */}
        <div className="mt-4">
          <div className="text-lg font-bold text-purple-700 mb-2 flex items-center gap-2 font-neue-bold"><BsPencil className="text-purple-400" /> Minhas Anotações</div>
          
          {/* Loading state */}
          {loadingEntradas && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <div className="text-purple-500 font-neue">Carregando suas anotações...</div>
            </div>
          )}
          
          {/* Mensagem quando não há entradas */}
          {!loadingEntradas && entradas.length === 0 && (
            <div className="text-gray-400 text-center italic font-neue">Nenhuma anotação ainda. Que tal começar hoje?</div>
          )}
          
          {/* Lista de entradas anteriores */}
          {!loadingEntradas && (
            <div className="flex flex-col gap-3">
              {entradas.map((e, idx) => (
                <div
                  key={e.id || idx}
                  className={`rounded-xl shadow p-4 flex items-center gap-3 border-l-4 transition group ${
                    e.isTemporary 
                      ? 'bg-purple-50/90 border-purple-300 opacity-80' 
                      : 'bg-white/80 border-purple-200'
                  }`}
                >
                  <span className="text-2xl">{e.humor !== null ? emojis[e.humor].emoji : "💭"}</span>
                  <div 
                    className="flex flex-col flex-1 cursor-pointer hover:bg-purple-50 rounded-lg p-2 -m-2 transition"
                    onClick={() => setVerEntrada(e)}
                  >
                    <span className="text-sm text-gray-500 mb-1 font-neue">{formatarData(e.data)}</span>
                    <span className="text-gray-700 font-neue text-base truncate max-w-[200px]">{e.texto.split(" ").slice(0, 10).join(" ")}{e.texto.split(" ").length > 10 ? '...' : ''}</span>
                  </div>
                  <button
                    onClick={(event) => handleIniciarDelete(e, event)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    title="Deletar anotação"
                  >
                    <BsTrash3 className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para visualizar entrada completa */}
        {verEntrada && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
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

        {/* Modal de confirmação para deletar */}
        {confirmandoDelete && entradaParaDeletar && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 text-center">
              {/* Ícone de aviso */}
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <BsTrash3 className="text-red-500 text-xl" />
              </div>
              
              {/* Título */}
              <h3 className="text-lg font-bold text-gray-800 font-neue-bold">Deletar anotação?</h3>
              
              {/* Descrição */}
              <p className="text-gray-600 font-neue">
                Tem certeza que deseja deletar esta anotação? Esta ação não pode ser desfeita.
              </p>
              
              {/* Preview da entrada */}
              <div className="bg-gray-50 rounded-lg p-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{entradaParaDeletar.humor !== null ? emojis[entradaParaDeletar.humor].emoji : "💭"}</span>
                  <span className="text-xs text-gray-500 font-neue">{formatarData(entradaParaDeletar.data)}</span>
                </div>
                <div className="text-sm text-gray-700 font-neue truncate">
                  {entradaParaDeletar.texto.split(" ").slice(0, 15).join(" ")}
                  {entradaParaDeletar.texto.split(" ").length > 15 ? '...' : ''}
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleCancelarDelete}
                  disabled={deletando}
                  className="flex-1 py-2 px-4 rounded-xl border border-gray-300 text-gray-700 font-neue-bold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarDelete}
                  disabled={deletando}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white font-neue-bold hover:bg-red-600 transition disabled:bg-red-400"
                >
                  {deletando ? "Deletando..." : "Deletar"}
                </button>
              </div>
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