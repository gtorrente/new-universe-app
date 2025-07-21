import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfigFront';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default function ReceitaPage({ receita }) {
  const navigate = useNavigate();
  const [favorita, setFavorita] = useState(false);
  const [user, setUser] = useState(null);
  const [animando, setAnimando] = useState(false);

  // Buscar usuário logado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Buscar status de favorito ao carregar
  useEffect(() => {
    async function checkFavorito() {
      if (!user || !receita?.id) return;
      const favRef = doc(db, 'usuarios', user.uid, 'favoritos', receita.id);
      const favSnap = await getDoc(favRef);
      setFavorita(favSnap.exists());
    }
    checkFavorito();
  }, [user, receita?.id]);

  async function handleFavoritar(e) {
    e.stopPropagation();
    if (!user) {
      alert('Faça login para favoritar receitas!');
      return;
    }
    const favRef = doc(db, 'usuarios', user.uid, 'favoritos', receita.id);
    if (favorita) {
      await deleteDoc(favRef);
      setFavorita(false);
    } else {
      await setDoc(favRef, { dataFavoritou: new Date() });
      setFavorita(true);
      // Animação
      setAnimando(true);
      setTimeout(() => setAnimando(false), 500);
    }
  }

  if (!receita) return <div className="p-8 text-center text-red-500">Receita não encontrada.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50 pb-8">
      {/* Botão de voltar estilo círculo com seta */}
      <div className="px-4 pt-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition text-purple-700 text-2xl"
          aria-label="Voltar"
        >
          ←
        </button>
      </div>
      {/* Imagem de destaque */}
      <div className="w-full h-[45vh] max-h-[340px] relative">
        {receita.imagem && (
          <img
            src={receita.imagem}
            alt={receita.nome}
            className="w-full h-full object-cover rounded-b-2xl shadow-lg"
          />
        )}
      </div>

      {/* Informações principais */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="bg-white/90 rounded-xl shadow p-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 w-full justify-center">
            <h1 className="text-2xl font-bold text-gray-800 font-neue-bold text-center flex-1">{receita.nome}</h1>
            <button
              className="ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
              aria-label="Favoritar"
              onClick={handleFavoritar}
            >
              <FaHeart
                className={`text-xl ${favorita ? 'text-red-500' : 'text-gray-300'}`}
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s, box-shadow 0.3s',
                  transform: animando ? 'scale(1.4) translateY(-6px)' : 'scale(1) translateY(0)',
                  filter: animando ? 'brightness(1.2)' : 'none',
                  boxShadow: animando ? '0 0 12px 2px #f87171' : 'none',
                }}
              />
            </button>
          </div>
          <div className="flex gap-4 text-sm text-gray-600 mt-1">
            {receita.tempo && <span>⏱ {receita.tempo}</span>}
            {receita.dificuldade && <span>📊 {receita.dificuldade}</span>}
          </div>
        </div>
      </div>

      {/* Ingredientes */}
      <div className="px-4 mt-8">
        <div className="bg-white/80 shadow-sm rounded-xl p-5">
          <h2 className="text-lg font-bold text-purple-700 mb-3 font-neue-bold">Ingredientes</h2>
          <ul className="list-disc pl-5 space-y-1 text-base leading-relaxed text-gray-800">
            {receita.ingredientes && receita.ingredientes.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modo de Preparo */}
      <div className="px-4 mt-8">
        <div className="bg-white/80 shadow-sm rounded-xl p-5">
          <h2 className="text-lg font-bold text-purple-700 mb-3 font-neue-bold">Modo de Preparo</h2>
          <ol className="list-decimal pl-5 space-y-3 text-lg leading-relaxed text-gray-700">
            {receita.preparo && receita.preparo.map((passo, idx) => (
              <li key={idx}>
                {passo}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Dica da Catia */}
      {receita.dica && (
        <div className="px-4 mt-8">
          <div className="italic text-purple-600 text-base text-center">
            ✨ {receita.dica}
          </div>
        </div>
      )}
    </div>
  );
} 