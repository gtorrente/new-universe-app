import ReceitaPage from '../components/ReceitaPage';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfigFront';

export default function ReceitaExemplo() {
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReceita() {
      setLoading(true);
      const docRef = doc(db, 'receitas', 'omelete');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setReceita({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    }
    fetchReceita();
  }, []);

  if (loading) return <div className="p-8 text-center text-purple-600">Carregando receita...</div>;
  if (!receita) return <div className="p-8 text-center text-red-500">Receita não encontrada.</div>;

  return <ReceitaPage receita={receita} favorita={false} onFavoritar={() => alert('Favoritou!')} />;
} 