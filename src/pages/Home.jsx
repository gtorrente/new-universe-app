// Página principal do app Universo Catia
// Exibe saudação, horóscopo do dia, atalhos rápidos e acesso ao chat com a CatIA

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaStar, 
  FaHeart, 
  FaComments, 
  FaUtensils, 
  FaGem, 
  FaInfinity,
  FaArrowRight,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaMinus,
  FaSpinner,
  FaEye,
  FaCalendarAlt
} from 'react-icons/fa';
import { TbChefHat } from 'react-icons/tb';
import Header from '../components/Header';
import PremiumModal from "../components/PremiumModal";
import { usePremiumModal } from "../hooks/usePremiumModal";
import { auth, db } from '../firebaseConfigFront';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import HoroscopeCard from '../components/HoroscopeCard'
import QuickAccessCard from '../components/QuickAccessCard'
import PremiumBenefitsCarousel from '../components/PremiumBenefitsCarousel'


function getSign(day, month) {
  const signs = [
    { sign: "Aquário", start: [1, 20], en: "aquarius" },
    { sign: "Peixes", start: [2, 19], en: "pisces" },
    { sign: "Áries", start: [3, 21], en: "aries" },
    { sign: "Touro", start: [4, 20], en: "taurus" },
    { sign: "Gêmeos", start: [5, 21], en: "gemini" },
    { sign: "Câncer", start: [6, 21], en: "cancer" },
    { sign: "Leão", start: [7, 23], en: "leo" },
    { sign: "Virgem", start: [8, 23], en: "virgo" },
    { sign: "Libra", start: [9, 23], en: "libra" },
    { sign: "Escorpião", start: [10, 23], en: "scorpio" },
    { sign: "Sagitário", start: [11, 22], en: "sagittarius" },
    { sign: "Capricórnio", start: [12, 22], en: "capricorn" },
  ];
  const date = new Date(2020, month - 1, day);
  for (let i = signs.length - 1; i >= 0; i--) {
    const [m, d] = signs[i].start;
    const startDate = new Date(2020, m - 1, d);
    if (date >= startDate) return signs[i];
  }
  return signs[signs.length - 1];
}

function getSignMapping() {
  return [
    { sign: "Aquário", en: "aquarius" },
    { sign: "Peixes", en: "pisces" },
    { sign: "Áries", en: "aries" },
    { sign: "Touro", en: "taurus" },
    { sign: "Gêmeos", en: "gemini" },
    { sign: "Câncer", en: "cancer" },
    { sign: "Leão", en: "leo" },
    { sign: "Virgem", en: "virgo" },
    { sign: "Libra", en: "libra" },
    { sign: "Escorpião", en: "scorpio" },
    { sign: "Sagitário", en: "sagittarius" },
    { sign: "Capricórnio", en: "capricorn" },
  ];
}

// Cache em memória para o horóscopo diário
const horoscopoDiarioCache = new Map();
const CACHE_DURATION_DIARIO = 6 * 60 * 60 * 1000; // 6 horas em millisegundos

// Função para verificar se o cache é válido
function isCacheValidDiario(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION_DIARIO;
}

// Função para obter chave do cache baseada no dia atual
function getDailyCacheKey(signo) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${signo}-${today}`;
}

function useHoroscopo(signoEn) {
  const [horoscopo, setHoroscopo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar horóscopo com cache inteligente
  const buscarHoroscopoDiario = useCallback(async (signo) => {
    if (!signo) return;

    const cacheKey = getDailyCacheKey(signo);
    
    // 1. Verifica cache em memória primeiro
    const cachedData = horoscopoDiarioCache.get(cacheKey);
    if (cachedData && isCacheValidDiario(cachedData.timestamp)) {
      console.log('📦 Horóscopo carregado do cache em memória');
      setHoroscopo(cachedData.data);
      setLoading(false);
      setError(null);
      return;
    }

    // 2. Verifica localStorage como backup
    try {
      const localCache = localStorage.getItem(`horoscopo-diario-${cacheKey}`);
      if (localCache) {
        const parsed = JSON.parse(localCache);
        if (isCacheValidDiario(parsed.timestamp)) {
          console.log('💾 Horóscopo carregado do localStorage');
          setHoroscopo(parsed.data);
          // Atualiza cache em memória
          horoscopoDiarioCache.set(cacheKey, parsed);
          setLoading(false);
          setError(null);
          return;
        } else {
          // Cache expirado - remove
          localStorage.removeItem(`horoscopo-diario-${cacheKey}`);
        }
      }
    } catch {
      // Ignora erros de cache corrompido
    }

    // 3. Busca na API apenas se não há cache válido
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se VITE_API_URL está configurada
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.torrente.com.br';
      console.log('🌐 Horóscopo: Usando API URL:', apiUrl);
      
      console.log('🌐 Horóscopo: Fazendo chamada para API:', `${apiUrl}/horoscopo`);
      
      const res = await fetch(`${apiUrl}/horoscopo?sign=${signo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.success) {
        // Melhorar tratamento de erro para mostrar mais detalhes
        let errorMessage = "Erro na API";
        
        if (data.error) {
          if (typeof data.error === 'object') {
            // Erro do Firebase (status NOT_FOUND)
            if (data.error.status === 'NOT_FOUND') {
              errorMessage = "Horóscopo ainda não foi gerado para hoje. Tente novamente em alguns minutos.";
              console.warn('🔄 Horóscopo não encontrado para hoje, pode estar sendo gerado...');
            } else {
              errorMessage = data.error.message || JSON.stringify(data.error);
            }
          } else {
            errorMessage = data.error;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const horoscopoTexto = data.data?.horoscopo?.mensagem || "Horóscopo indisponível.";
      
      setHoroscopo(horoscopoTexto);

      // 4. Salva no cache (memória + localStorage)
      const cacheData = {
        data: horoscopoTexto,
        timestamp: Date.now()
      };
      
      horoscopoDiarioCache.set(cacheKey, cacheData);
      localStorage.setItem(`horoscopo-diario-${cacheKey}`, JSON.stringify(cacheData));
      
      console.log('🌐 Horóscopo carregado da API e salvo no cache');
      
    } catch (err) {
      console.error("Erro ao buscar horóscopo diário da API:", err);
      
      // Fallback: Buscar diretamente do Firebase
      try {
        console.log('🔄 Tentando buscar horóscopo diretamente do Firebase...');
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const horoscopoRef = doc(db, 'horoscopo_diario', today, signo, 'horoscopo');
        const horoscopoSnap = await getDoc(horoscopoRef);
        
        if (horoscopoSnap.exists()) {
          const horoscopoData = horoscopoSnap.data();
          const horoscopoTexto = horoscopoData.texto || "Horóscopo indisponível.";
          
          setHoroscopo(horoscopoTexto);
          setError(null);
          
          // Salva no cache
          const cacheData = {
            data: horoscopoTexto,
            timestamp: Date.now()
          };
          
          horoscopoDiarioCache.set(cacheKey, cacheData);
          localStorage.setItem(`horoscopo-diario-${cacheKey}`, JSON.stringify(cacheData));
          
          console.log('✅ Horóscopo carregado diretamente do Firebase');
        } else {
          throw new Error('Horóscopo não encontrado no Firebase');
        }
      } catch (firebaseErr) {
        console.error("Erro ao buscar do Firebase:", firebaseErr);
        setError("Não foi possível carregar o horóscopo hoje.");
        setHoroscopo("Horóscopo temporariamente indisponível.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (signoEn) {
      buscarHoroscopoDiario(signoEn);
    }
  }, [signoEn, buscarHoroscopoDiario]);

  return { horoscopo, loading, error, refresh: () => buscarHoroscopoDiario(signoEn) };
}

export default function Home() {
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [dataNascimento, setDataNascimento] = useState('');
  const [userDocId, setUserDocId] = useState(null);
  const [signo, setSigno] = useState('');
  const [signoEn, setSignoEn] = useState('');

  // Hook do modal premium para onboarding
  const { 
    showModal: showPremiumModal, 
    handleOpenModal,    // ✅ NOVO: Para abrir modal
    handleCloseModal, 
    handleSubscribe 
  } = usePremiumModal();

  // Limpeza automática do cache expirado
  useEffect(() => {
    const cleanupCache = () => {
      // Limpa cache em memória
      for (const [key, value] of horoscopoDiarioCache.entries()) {
        if (!isCacheValidDiario(value.timestamp)) {
          horoscopoDiarioCache.delete(key);
        }
      }
      
      // Limpa localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('horoscopo-diario-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (!isCacheValidDiario(data.timestamp)) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key); // Remove dados corrompidos
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 Cache de horóscopo limpo: ${keysToRemove.length} itens expirados removidos`);
      }
    };

    // Executa limpeza na inicialização
    cleanupCache();
    
    // Executa limpeza a cada hora
    const interval = setInterval(cleanupCache, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Efeito para buscar usuário autenticado e créditos no Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("👤 Home: Usuário detectado:", !!firebaseUser);
      if (firebaseUser) {
        console.log("📧 Home: Email:", firebaseUser.email);
        console.log("📛 Home: Nome:", firebaseUser.displayName);
        console.log("📸 Home: Foto URL:", firebaseUser.photoURL);
      }
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        
        setUserDocId(firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Atualizar dados básicos do usuário sempre (incluindo foto)
          console.log("📸 Foto do usuário no Firebase Auth:", firebaseUser.photoURL);
          const dadosBasicos = {
            nome: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            foto: firebaseUser.photoURL || "",
          };
          
          // Garantir que usuário sempre tenha créditos (mínimo 5 se for novo)
          if (userData.creditos === undefined || userData.creditos === null) {
            console.log("🎁 Novo usuário! Atribuindo 5 créditos iniciais");
            dadosBasicos.creditos = 5;
            setCreditos(5);
          } else {
            setCreditos(userData.creditos);
          }
          
          // Salvar todos os dados de uma vez
          await updateDoc(userRef, dadosBasicos);
          
          const dataNasc = userData.dataNascimento;
          const signSalvo = userData.sign; // Campo signo salvo no Firebase
          
          if (dataNasc) {
            console.log('📅 Data de nascimento encontrada:', dataNasc);
            
            // Se já tem signo salvo, usa ele
            if (signSalvo) {
              console.log('✅ Signo salvo no Firebase:', signSalvo);
              setSignoEn(signSalvo);
              
              // Converte de inglês para português para exibição
              const signObj = getSignMapping().find(s => s.en === signSalvo);
              console.log('🔄 Conversão EN->PT:', { signSalvo, signObj });
              
              const signoPortugues = signObj ? signObj.sign : "";
              setSigno(signoPortugues);
              
              console.log('🎯 Signo definido:', { signoEn: signSalvo, signo: signoPortugues });
            } else {
              console.log('❓ Signo não salvo, calculando...');
              
              // Se não tem signo salvo, calcula e salva
              const [, mes, dia] = dataNasc.split('-').map(Number);
              console.log('📊 Dados para calcular signo:', { dia, mes });
              
              const signObj = getSign(dia, mes);
              console.log('🎯 Signo calculado:', signObj);
              
              setSigno(signObj.sign);
              setSignoEn(signObj.en);
              
              console.log('💾 Salvando signo no Firebase:', signObj.en);
              
              // Salva o signo no Firebase
              await updateDoc(userRef, { sign: signObj.en });
              
              console.log('✅ Estados atualizados:', { signo: signObj.sign, signoEn: signObj.en });
            }
          }
          if (!dataNasc) setShowModal(true);
        } else {
          // Usuário completamente novo - criar documento com dados completos
          console.log("👤 Usuário completamente novo! Criando documento com 5 créditos");
          await updateDoc(userRef, {
            nome: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            foto: firebaseUser.photoURL || "",
            creditos: 5
          });
          setCreditos(5);
          setShowModal(true);
        }
      } else {
        setCreditos(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Função para salvar data de nascimento e calcular signo
  async function handleSalvarData() {
    if (!dataNascimento || !userDocId) return;
    
    console.log('💾 Salvando data de nascimento:', dataNascimento);
    
    const userRef = doc(db, "usuarios", userDocId);
    
    // Calcular o signo baseado na data de nascimento
    const [, mes, dia] = dataNascimento.split('-').map(Number);
    console.log('📅 Data parseada:', { dia, mes });
    
    const signObj = getSign(dia, mes);
    console.log('🎯 Signo calculado:', signObj);
    
    // Verificar se usuário tem créditos, se não tiver, dar 5 iniciais
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const creditosAtuais = userData.creditos;
    
    // Salvar data, signo e garantir créditos iniciais
    const dadosParaSalvar = { 
      dataNascimento,
      sign: signObj.en // Salva o signo em inglês
    };
    
    // Se não tem créditos definidos, dar 5 iniciais
    if (creditosAtuais === undefined || creditosAtuais === null) {
      console.log("🎁 Atribuindo 5 créditos iniciais ao salvar data de nascimento");
      dadosParaSalvar.creditos = 5;
      setCreditos(5);
    }
    
    console.log('💾 Dados a salvar no Firebase:', dadosParaSalvar);
    await updateDoc(userRef, dadosParaSalvar);
    
    // Atualizar o estado local
    console.log('🔄 Atualizando estado local:', { signo: signObj.sign, signoEn: signObj.en });
    setSigno(signObj.sign);
    setSignoEn(signObj.en);
    setShowModal(false);
  }

  const { horoscopo, loading: loadingHoroscopo, error: errorHoroscopo, refresh } = useHoroscopo(signoEn);

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen">
      {/* Modal de onboarding para data de nascimento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-xs w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-purple-700">Bem-vindo(a) ao Universo Catia!</h2>
            <p className="mb-4 text-gray-700 text-center">
              Para personalizar sua experiência astrológica, diga sua data de nascimento:
            </p>
            <input
              type="date"
              className="border rounded px-4 py-2 mb-4 w-full text-center"
              value={dataNascimento}
              onChange={e => setDataNascimento(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <button 
              className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 w-full"
              onClick={handleSalvarData}
              disabled={!dataNascimento}
            >
              Avançar
            </button>
          </div>
        </div>
      )}
      {/* Header global com avatar, saudação e créditos */}
      <Header user={user} creditos={creditos} />

      {/* Saudação e pergunta do dia */}
      <div className="px-4 mt-4 mb-2">
        <p className="text-sm text-gray-500 font-neue">Como você está se sentindo hoje?</p>
      </div>

      {/* Card do horóscopo do dia */}
      <div className="px-4">
        <div className="relative" style={{ height: 'auto', minHeight: 'auto' }}>
          <HoroscopeCard
            sign={signo || "Seu signo"}
            energy={4}
            message={loadingHoroscopo ? "Carregando horóscopo..." : horoscopo}
          />
          
          {/* Botão de refresh em caso de erro */}
          {errorHoroscopo && !loadingHoroscopo && (
            <div className="absolute bottom-2 right-2">
              <button 
                onClick={refresh}
                className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full transition"
                title="Tentar carregar novamente"
              >
                🔄 Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid de cards de acesso rápido para funcionalidades principais */}
      <div className="grid grid-cols-2 gap-4 mt-6 px-4">
        <QuickAccessCard title="Mapa Astral" subtitle="Descubra sua personalidade" icon={<FaStar />} onClick={() => navigate('/mapa-astral')} />
        <QuickAccessCard title="Receitas da Catia" subtitle="Simples e deliciosas" icon={<TbChefHat />} onClick={() => navigate('/receitas')} />
        <QuickAccessCard title="Tarot do Dia" subtitle="Orientação para hoje" icon={<FaEye />} onClick={() => navigate('/tarot')} />
        <QuickAccessCard title="Previsão" subtitle="Semana astrológica" icon={<FaCalendarAlt />} onClick={() => navigate('/previsao')} />
      </div>

      {/* Botão para acessar o chat com a CatIA */}
      <div className="px-4 mt-6">
        <button
          onClick={() => navigate('/catia')}
          className="w-full rounded-2xl p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow text-center font-bold text-lg flex items-center justify-center gap-3 transition hover:scale-105 focus:outline-none"
        >
          <img src="/logo-ai.png" alt="CatIA" className="w-8 h-8" />
          <span>Converse com a CatIA</span>
        </button>
      </div>

      {/* Carrossel de Benefícios Premium */}
      <div className="mt-8 mb-6">
        <PremiumBenefitsCarousel onSubscribeClick={handleOpenModal} />
      </div>

      {/* Modal Premium para Onboarding */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={handleCloseModal}
        onSubscribe={handleSubscribe}
      />
    </div>
  )
}
