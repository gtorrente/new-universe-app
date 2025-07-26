// Página de Receitas da CatIA do app Universo Catia
// Exibe categorias de receitas, receita em destaque e convite para assinatura premium

import { useState, useEffect } from 'react';
import { TbChefHat, TbLock, TbStar, TbHeart, TbArrowRight } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PremiumModal from '../components/PremiumModal';
import { auth, db } from '../firebaseConfigFront';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
// import receitasData from '../data/receitas.json'; // Não usado mais

export default function Receitas() {
  // Simulação do estado de assinatura premium
  const [isPremium] = useState(false);
  
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Estado do modal premium
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  // Buscar categorias do Firestore
  useEffect(() => {
    async function fetchCategorias() {
      setLoadingCategorias(true);
      console.log("🍳 Carregando categorias do Firebase...");
      
      try {
        const querySnapshot = await getDocs(collection(db, 'categorias'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log("📊 Categorias encontradas:", data.length);
        console.log("📝 Dados das categorias:", data);
        
        if (data.length === 0) {
          console.log("⚠️ Nenhuma categoria encontrada no Firebase, usando dados estáticos");
          // Fallback para dados estáticos se Firebase estiver vazio
          const categoriasEstaticas = [
            {
              id: "caldos",
              titulo: "Caldos e Sopas",
              emoji: "🍲", 
              imagem: "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=600&h=400&fit=crop",
              descricao: "Receitas quentinhas para aquecer o coração.",
              premium: false
            },
            {
              id: "basico",
              titulo: "Básico na Cozinha",
              emoji: "🍳",
              imagem: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&h=400&fit=crop", 
              descricao: "O essencial para quem está começando.",
              premium: false
            },
            {
              id: "italianas",
              titulo: "Delícias Italianas", 
              emoji: "🍝",
              imagem: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
              descricao: "Receitas cheias de sabor para adoçar seu dia.",
              premium: true
            }
          ];
          setCategorias(categoriasEstaticas);
        } else {
          setCategorias(data);
        }
        
      } catch (error) {
        console.error("❌ Erro ao carregar categorias:", error);
        
        // Fallback em caso de erro
        const categoriasEstaticas = [
          {
            id: "caldos",
            titulo: "Caldos e Sopas", 
            emoji: "🍲",
            imagem: "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=600&h=400&fit=crop",
            descricao: "Receitas quentinhas para aquecer o coração.",
            premium: false
          },
          {
            id: "basico", 
            titulo: "Básico na Cozinha",
            emoji: "🍳",
            imagem: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&h=400&fit=crop",
            descricao: "O essencial para quem está começando.",
            premium: false
          }
        ];
        setCategorias(categoriasEstaticas);
      } finally {
        setLoadingCategorias(false);
      }
    }
    fetchCategorias();
  }, []);

  // Funções do modal premium
  const handleOpenPremiumModal = () => {
    setShowPremiumModal(true);
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleSubscribe = (planType) => {
    console.log('Usuário quer assinar:', planType);
    // Aqui você pode integrar com o sistema de pagamento
    handleClosePremiumModal();
    return { planType, userId: user?.uid };
  };

  // Dados da receita em destaque (gratuita)
  const receitaDestaque = {
    nome: 'Sopa de Abóbora com Gengibre',
    descricao: 'Uma sopa reconfortante que aquece o coração e nutre a alma',
    imagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    tempo: '30 min',
    dificuldade: 'Fácil'
  };

  const navigate = useNavigate();

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
          {loadingCategorias ? (
            <div className="text-center text-purple-600 py-8">Carregando categorias...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                    categoria.premium && !isPremium ? 'opacity-75' : ''
                  }`}
                  onClick={() => navigate(`/receitas/categoria/${categoria.id}`)}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Imagem da categoria */}
                    <div className="relative h-32">
                      <img
                        src={categoria.imagem}
                        alt={categoria.titulo}
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
                        {categoria.titulo}
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
          )}
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
            <button 
              onClick={handleOpenPremiumModal}
              className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
            >
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

        {/* Modal Premium */}
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={handleClosePremiumModal}
          onSubscribe={handleSubscribe}
        />
      </div>
    </div>
  );
}