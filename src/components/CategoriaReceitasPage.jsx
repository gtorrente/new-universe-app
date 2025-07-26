import { FaHeart, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfigFront';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default function CategoriaReceitasPage({ titulo, descricao, emoji, receitas, onVoltar, onPremiumClick }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favoritos, setFavoritos] = useState({}); // { [receitaId]: true }
  const [animando, setAnimando] = useState({}); // { [receitaId]: true }

  // Buscar usuário logado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Buscar status de favoritos ao carregar receitas ou usuário
  useEffect(() => {
    async function fetchFavoritos() {
      if (!user || !receitas?.length) return;
      const favs = {};
      for (const r of receitas) {
        if (!r.id) continue;
        const favRef = doc(db, 'usuarios', user.uid, 'favoritos', r.id);
        const favSnap = await getDoc(favRef);
        favs[r.id] = favSnap.exists();
      }
      setFavoritos(favs);
    }
    fetchFavoritos();
  }, [user, receitas]);

  async function handleFavoritar(e, receita) {
    e.stopPropagation();
    if (!user) {
      alert('Faça login para favoritar receitas!');
      return;
    }
    const favRef = doc(db, 'usuarios', user.uid, 'favoritos', receita.id);
    if (favoritos[receita.id]) {
      await deleteDoc(favRef);
      setFavoritos(favs => ({ ...favs, [receita.id]: false }));
    } else {
      await setDoc(favRef, { dataFavoritou: new Date() });
      setFavoritos(favs => ({ ...favs, [receita.id]: true }));
      setAnimando(a => ({ ...a, [receita.id]: true }));
      setTimeout(() => setAnimando(a => ({ ...a, [receita.id]: false })), 400);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50">
      {/* Topo */}
      <div className="relative px-4 pt-6 pb-2 flex items-center">
        {/* Botão de voltar */}
        <button
          onClick={onVoltar}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-purple-100 transition"
          aria-label="Voltar"
        >
          <span className="text-2xl">←</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            {emoji && <span className="text-3xl select-none">{emoji}</span>}
            <h1 className="text-2xl font-bold text-gray-800 font-neue-bold text-center">{titulo}</h1>
          </div>
          <p className="text-gray-500 text-sm text-center max-w-md font-neue mb-2">{descricao}</p>
        </div>
      </div>

      {/* Grid de receitas */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {receitas.map((r, idx) => (
            <div
              key={r.nome + idx}
              className={`relative group rounded-2xl overflow-hidden shadow-lg bg-white transition-all duration-300 cursor-pointer hover:scale-105 ${r.premium ? 'opacity-80' : ''}`}
              onClick={() => {
                if (r.premium) {
                  onPremiumClick();
                  return;
                }
                if (r.id) navigate(`/receita/${r.id}`);
              }}
            >
              {/* Imagem da receita */}
              <div className="relative w-full aspect-square bg-gray-100">
                <img
                  src={r.imagem}
                  alt={r.nome}
                  className={`w-full h-full object-cover ${r.premium ? 'opacity-60' : ''}`}
                />
                {/* Ícone de cadeado para premium */}
                {r.premium && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaLock className="text-3xl text-purple-500 opacity-80" />
                  </div>
                )}
                {/* Ícone de favorito para liberadas */}
                {!r.premium && (
                  <button
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-red-100 transition"
                    aria-label="Favoritar"
                    onClick={e => handleFavoritar(e, r)}
                  >
                    <FaHeart
                      className={`text-lg ${favoritos[r.id] ? 'text-red-500' : 'text-gray-300'}`}
                      style={{
                        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s, box-shadow 0.3s',
                        transform: animando[r.id] ? 'scale(1.4) translateY(-6px)' : 'scale(1) translateY(0)',
                        filter: animando[r.id] ? 'brightness(1.2)' : 'none',
                        boxShadow: animando[r.id] ? '0 0 12px 2px #f87171' : 'none',
                      }}
                    />
                  </button>
                )}
              </div>
              {/* Nome da receita e infos */}
              <div className="p-3 flex flex-col items-center">
                <span className="font-semibold text-gray-800 text-center font-neue-bold text-base line-clamp-2">{r.nome}</span>
                {/* Tempo e dificuldade */}
                <div className="flex gap-2 mt-1 text-xs text-gray-500 font-neue items-center">
                  {r.tempo && <span>⏱️ {r.tempo}</span>}
                  {r.dificuldade && <span>📊 {r.dificuldade}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 