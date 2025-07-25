import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfigFront';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart } from 'react-icons/fa';

export default function ReceitasSalvas() {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) { 
        // Buscar favoritos do usuário
        const favsSnap = await getDocs(collection(db, 'usuarios', firebaseUser.uid, 'favoritos'));
        const favIds = favsSnap.docs.map(doc => doc.id);
        if (favIds.length) {
          // Buscar detalhes das receitas favoritas
          const receitasSnap = await getDocs(collection(db, 'receitas'));
          const receitasAll = receitasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReceitas(receitasAll.filter(r => favIds.includes(r.id)));
        } else {
          setReceitas([]);
        }
      } else {
        setReceitas([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Carregando receitas salvas...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-red-500">Faça login para ver suas receitas salvas.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/perfil')}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Receitas Salvas</h1>
            <p className="text-sm text-gray-500">
              {receitas.length} receitas favoritas
            </p>
          </div>
          <div className="flex items-center text-purple-600">
            <FaHeart size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {receitas.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma receita salva</h3>
            <p className="text-gray-500 mb-6">Explore as receitas e salve suas favoritas!</p>
            <button 
              onClick={() => navigate('/receitas')}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
            >
              Explorar Receitas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {receitas.map(r => (
              <div
                key={r.id}
                className="relative group rounded-2xl overflow-hidden shadow-lg bg-white cursor-pointer hover:scale-105 transition-all"
                onClick={() => navigate(`/receita/${r.id}`)}
              >
                <div className="relative w-full aspect-square bg-gray-100">
                  {r.imagem && (
                    <img
                      src={r.imagem}
                      alt={r.nome}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3 text-center">
                  <span className="font-semibold text-gray-800 text-sm font-neue-bold line-clamp-2">{r.nome}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 