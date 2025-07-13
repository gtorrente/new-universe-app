// Página de Receitas da CatIA do app Universo Catia
// Exibe categorias de receitas, receita em destaque e convite para assinatura premium

import { useState, useEffect } from 'react';
import { TbChefHat, TbLock, TbStar, TbHeart, TbArrowRight } from 'react-icons/tb';
import Header from '../components/Header';
import { auth, db } from '../firebaseConfigFront';
import { doc, getDoc } from 'firebase/firestore';

export default function Receitas() {
  // Simulação do estado de assinatura premium
  const [isPremium] = useState(false);
  
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);

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

  // Dados das categorias de receitas com informações de premium
  const categorias = [
    {
      id: 1,
      nome: 'Caldos e Sopas',
      emoji: '🍲',
      imagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
      premium: false // Categoria gratuita
    },
    {
      id: 2,
      nome: 'Básico na Cozinha',
      emoji: '🍳',
      imagem: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      premium: true // Categoria premium
    },
    {
      id: 3,
      nome: 'Delícias Italianas',
      emoji: '🍝',
      imagem: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
      premium: true // Categoria premium
    },
    {
      id: 4,
      nome: 'Festas e Eventos',
      emoji: '🎉',
      imagem: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
      premium: true // Categoria premium
    },
    {
      id: 5,
      nome: 'Receitas da Padaria',
      emoji: '🥐',
      imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      premium: false // Categoria gratuita
    }
  ];

  // Dados da receita em destaque (gratuita)
  const receitaDestaque = {
    nome: 'Sopa de Abóbora com Gengibre',
    descricao: 'Uma sopa reconfortante que aquece o coração e nutre a alma',
    imagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    tempo: '30 min',
    dificuldade: 'Fácil'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50">
      {/* Header padrão do app com usuário e créditos */}
      <Header user={user} creditos={creditos} />
      
      {/* Header visual específico da página de Receitas */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div>
              {/* Título e subtítulo da seção */}
              <h1 className="text-2xl font-bold text-gray-800 font-neue-bold">
                Receitas da Catia Fonseca
              </h1>
              <p className="text-sm text-gray-600 font-neue">
                Delícias para adoçar o seu dia. Algumas são por minha conta, outras com um toque especial do Universo+.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Seção de Categorias de Receitas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 font-neue-bold">
            Categorias
          </h2>
          {/* Grid responsivo de categorias */}
          <div className="grid grid-cols-2 gap-4">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                  categoria.premium && !isPremium ? 'opacity-75' : ''
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Imagem da categoria */}
                  <div className="relative h-32">
                    <img
                      src={categoria.imagem}
                      alt={categoria.nome}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay de bloqueio para categorias premium */}
                    {categoria.premium && !isPremium && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                          <TbLock className="text-purple-600 text-xl" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Informações da categoria */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{categoria.emoji}</span>
                      {/* Ícone de estrela para categorias premium */}
                      {categoria.premium && (
                        <TbStar className="text-yellow-500 text-sm" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm font-neue-bold">
                      {categoria.nome}
                    </h3>
                    {/* Badge Universo+ para categorias premium */}
                    {categoria.premium && !isPremium && (
                      <p className="text-xs text-purple-600 mt-1 font-neue">
                        Universo+
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Receita em Destaque (Gratuita) */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Imagem da receita com overlay gradiente */}
          <div className="relative h-48">
            <img
              src={receitaDestaque.imagem}
              alt={receitaDestaque.nome}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {/* Informações sobrepostas na imagem */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white text-sm bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  ⭐ Receita da Semana
                </span>
              </div>
              <h3 className="text-white text-xl font-bold font-neue-bold">
                {receitaDestaque.nome}
              </h3>
              <p className="text-white/90 text-sm font-neue">
                {receitaDestaque.descricao}
              </p>
            </div>
          </div>
          {/* Detalhes da receita */}
          <div className="p-6">
            {/* Informações de tempo e dificuldade */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>⏱️ {receitaDestaque.tempo}</span>
                <span>📊 {receitaDestaque.dificuldade}</span>
              </div>
            </div>
            {/* Microcopy afetivo da CatIA */}
            <p className="text-sm text-gray-600 mb-4 font-neue italic">
              "Essa é por minha conta, viu? Capricha na colher de carinho."
            </p>
            {/* Botão de ação */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2">
              Ver Receita
              <TbArrowRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Seção de Convite para Assinatura Premium */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
            {/* Cabeçalho do convite */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TbStar className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-neue-bold">
                Quer receitas exclusivas, com dicas secretas da CatIA?
              </h3>
            </div>
            
            {/* Lista de benefícios */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <TbHeart className="text-sm" />
                </div>
                <span className="text-sm font-neue">Acesso total às receitas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <TbChefHat className="text-sm" />
                </div>
                <span className="text-sm font-neue">Truques secretos e receitas de família</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">✨</span>
                </div>
                <span className="text-sm font-neue">Novas delícias toda semana</span>
              </div>
            </div>

            {/* Botão de assinatura */}
            <button className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300">
              Assinar Universo+
            </button>
          </div>
        )}

        {/* Rodapé explicativo */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 font-neue leading-relaxed">
            Algumas receitas são só pra quem faz parte do Universo+. Mas não se preocupe, tem sempre uma delícia esperando por você.
          </p>
        </div>
      </div>
    </div>
  );
}