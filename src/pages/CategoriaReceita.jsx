import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CategoriaReceitasPage from '../components/CategoriaReceitasPage';
import { db } from '../firebaseConfigFront';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export default function CategoriaReceita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Buscar categoria
      const catRef = doc(db, 'categorias', id);
      const catSnap = await getDoc(catRef);
      if (!catSnap.exists()) {
        setCategoria(null);
        setLoading(false);
        return;
      }
      setCategoria(catSnap.data());
      // Buscar receitas da categoria
      const receitasQuery = query(collection(db, 'receitas'), where('categoriaId', '==', id));
      const receitasSnap = await getDocs(receitasQuery);
      setReceitas(receitasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-purple-600">Carregando...</div>;
  if (!categoria) {
    return <div className="p-8 text-center text-red-500">Categoria não encontrada.</div>;
  }

  return (
    <CategoriaReceitasPage
      titulo={categoria.titulo}
      descricao={categoria.descricao}
      emoji={categoria.emoji}
      receitas={receitas}
      onVoltar={() => navigate(-1)}
    />
  );
} 