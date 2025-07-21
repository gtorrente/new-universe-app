import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfigFront';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

  if (loading) return <div className="p-8 text-center text-purple-600">Carregando receitas salvas...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">Faça login para ver suas receitas salvas.</div>;
  if (!receitas.length) return <div className="p-8 text-center text-gray-500">Nenhuma receita salva ainda.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Receitas Salvas</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
            <div className="p-2 text-center">
              <span className="font-semibold text-gray-800 text-sm font-neue-bold line-clamp-2">{r.nome}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 