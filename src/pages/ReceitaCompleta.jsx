import { useParams } from 'react-router-dom';
import ReceitaPage from '../components/ReceitaPage';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfigFront';

export default function ReceitaCompleta() {
  const { id } = useParams();
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReceita() {
      setLoading(true);
      const receitasQuery = query(collection(db, 'receitas'), where('id', '==', id));
      const receitasSnap = await getDocs(receitasQuery);
      if (!receitasSnap.empty) {
        setReceita({ id: receitasSnap.docs[0].id, ...receitasSnap.docs[0].data() });
      }
      setLoading(false);
    }
    fetchReceita();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-purple-600">Carregando receita...</div>;
  if (!receita) return <div className="p-8 text-center text-red-500">Receita não encontrada.</div>;

  // Corrigir renderização da imagem dentro do ReceitaPage, se necessário
  return <ReceitaPage receita={receita} favorita={false} onFavoritar={() => alert('Favoritou!')} />;
} 