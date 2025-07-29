import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";

import { FaStar, FaRegPlayCircle, FaRegEdit, FaRegHeart } from 'react-icons/fa';
import { BsFillSunFill, BsFillMoonStarsFill } from 'react-icons/bs';
import { GiPlanetConquest } from 'react-icons/gi';

// Mapeamento de ícones da API para componentes React
const iconesMap = {
  "FaStar": <FaStar className="text-yellow-400" />,
  "FaRegHeart": <FaRegHeart className="text-pink-400" />,
  "FaRegEdit": <FaRegEdit className="text-green-400" />,
  "BsFillSunFill": <BsFillSunFill className="text-orange-400" />,
  "BsFillMoonStarsFill": <BsFillMoonStarsFill className="text-blue-400" />,
  "GiPlanetConquest": <GiPlanetConquest className="text-purple-400" />
};

const nomesSignos = {
  aries: "Áries",
  taurus: "Touro",
  gemini: "Gêmeos",
  cancer: "Câncer",
  leo: "Leão",
  virgo: "Virgem",
  libra: "Libra",
  scorpio: "Escorpião",
  sagittarius: "Sagitário",
  capricorn: "Capricórnio",
  aquarius: "Aquário",
  pisces: "Peixes"
};

// Cache em memória para os horóscopos semanais
const horoscopoCache = new Map();
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas em millisegundos

// Função para verificar se o cache é válido
function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

// Função para obter chave do cache baseada na semana atual
function getWeekCacheKey(signo) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekKey = startOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${signo}-${weekKey}`;
}

export default function PrevisaoSemanal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [signoUsuario, setSignoUsuario] = useState(null);
  const [destaque, setDestaque] = useState(null);
  const [semana, setSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para áudio
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioElement, setAudioElement] = useState(null);
  const [mensagemAudioCatia, setMensagemAudioCatia] = useState("");

  // Limpeza automática do cache expirado
  useEffect(() => {
    const cleanupCache = () => {
      // Limpa cache em memória
      for (const [key, value] of horoscopoCache.entries()) {
        if (!isCacheValid(value.timestamp)) {
          horoscopoCache.delete(key);
        }
      }
      
      // Limpa localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('horoscopo-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (!isCacheValid(data.timestamp)) {
              keysToRemove.push(key);
            }
                     } catch {
             keysToRemove.push(key); // Remove dados corrompidos
           }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 Cache limpo: ${keysToRemove.length} itens expirados removidos`);
      }
    };

    // Executa limpeza na inicialização
    cleanupCache();
    
    // Executa limpeza a cada 30 minutos
    const interval = setInterval(cleanupCache, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Recupera usuário + dados do Firestore
  useEffect(() => {
    console.log("🌟 Previsão: Iniciando carregamento do usuário");
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("🌟 Previsão: Usuário autenticado:", !!firebaseUser);
      
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          console.log("🌟 Previsão: Buscando dados do usuário no Firestore");
          const userRef = doc(db, "usuarios", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const dados = userSnap.data();
            console.log("🌟 Previsão: Dados do usuário:", dados);
            
            setCreditos(dados.creditos || 0);
            const signo = (dados.sign || "").toLowerCase();
            console.log("🌟 Previsão: Signo encontrado:", signo);
            setSignoUsuario(signo);
          } else {
            console.log("❌ Previsão: Documento do usuário não encontrado");
            setCreditos(0);
            setSignoUsuario("");
          }
        } catch (error) {
          console.error("❌ Previsão: Erro ao buscar dados:", error);
          setCreditos(0);
          setSignoUsuario("");
        }
      } else {
        setCreditos(0);
        setSignoUsuario("");
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para buscar horóscopo com cache inteligente
  const buscarHoroscopoSemanal = useCallback(async (signo) => {
    console.log("🌟 Previsão: Buscando horóscopo para signo:", signo);
    
    if (!signo) {
      console.log("❌ Previsão: Signo vazio, não buscando");
      return;
    }

    const cacheKey = getWeekCacheKey(signo);
    console.log("📦 Previsão: Cache key:", cacheKey);
    
    // 1. Verifica cache em memória primeiro
    const cachedData = horoscopoCache.get(cacheKey);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      console.log('📦 Dados carregados do cache em memória');
      setDestaque(cachedData.data.destaque);
      setSemana(cachedData.data.semana);
      setMensagemAudioCatia(cachedData.data.mensagem_audio_catia || cachedData.data.destaque?.mensagem_audio_catia || "");
      setLoading(false);
      return;
    }

    // 2. Verifica localStorage como backup
    try {
      const localCache = localStorage.getItem(`horoscopo-${cacheKey}`);
      if (localCache) {
        const parsed = JSON.parse(localCache);
        if (isCacheValid(parsed.timestamp)) {
          console.log('💾 Dados carregados do localStorage');
          setDestaque(parsed.data.destaque);
          setSemana(parsed.data.semana);
          setMensagemAudioCatia(parsed.data.mensagem_audio_catia || parsed.data.destaque?.mensagem_audio_catia || "");
          // Atualiza cache em memória
          horoscopoCache.set(cacheKey, parsed);
          setLoading(false);
          return;
        } else {
          // Cache expirado - remove
          localStorage.removeItem(`horoscopo-${cacheKey}`);
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
      console.log('🌐 Previsão: Usando API URL:', apiUrl);
      
      console.log("🌐 Previsão: Fazendo chamada para API com signo:", signo);
      console.log("🌐 Previsão: URL da API:", `${apiUrl}/horoscopo-semanal`);
      
      const res = await fetch(`${apiUrl}/horoscopo-semanal?sign=${signo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      console.log("📡 Previsão: Resposta da API status:", res.status);

      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Previsão: Dados recebidos da API:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Erro na API");
      }
      
      const semanaFormatada = [
        { dia: "Seg", ...data.data.semana.segunda },
        { dia: "Ter", ...data.data.semana.terca },
        { dia: "Qua", ...data.data.semana.quarta },
        { dia: "Qui", ...data.data.semana.quinta },
        { dia: "Sex", ...data.data.semana.sexta },
        { dia: "Sáb", ...data.data.semana.sabado },
        { dia: "Dom", ...data.data.semana.domingo }
      ];

      setDestaque(data.data.destaque);
      setSemana(semanaFormatada);
      setMensagemAudioCatia(data.data.destaque?.mensagem_audio || data.data.destaque?.mensagem || "");

      // 4. Salva no cache (memória + localStorage)
      const cacheData = {
        data: {
          destaque: data.data.destaque,
          semana: semanaFormatada,
          mensagem_audio_catia: data.data.destaque?.mensagem_audio || data.data.destaque?.mensagem || ""
        },
        timestamp: Date.now()
      };
      
      horoscopoCache.set(cacheKey, cacheData);
      localStorage.setItem(`horoscopo-${cacheKey}`, JSON.stringify(cacheData));
      
      console.log('🌐 Dados carregados da API e salvos no cache');
      
    } catch (err) {
      console.error("Erro ao buscar horóscopo semanal:", err);
      setError("Não foi possível carregar a previsão semanal. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para gerar áudio com ElevenLabs
  const gerarAudio = async () => { 
    if (!mensagemAudioCatia.trim()) {
      alert("Nenhum texto disponível para converter em áudio.");
      return;
    }

    setAudioLoading(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/xZETILMRdLQFcQtToSrt', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_e3223ad0ff3cb2ab41f3f4fa74ac96062365fc74d25c1b56'
        },
        body: JSON.stringify({
          text: mensagemAudioCatia,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API ElevenLabs: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cria elemento de áudio
      const audio = new Audio(audioUrl);
      
      // Event listeners para controlar o player
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      
      audio.addEventListener('timeupdate', () => {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      });
      
      audio.addEventListener('ended', () => {
        setAudioPlaying(false);
        setAudioProgress(0);
      });

      setAudioElement(audio);
      
      // Reproduz automaticamente
      audio.play();
      setAudioPlaying(true);

    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      alert('Não foi possível gerar o áudio. Tente novamente.');
    } finally {
      setAudioLoading(false);
    }
  };

  // Função para controlar play/pause
  const toggleAudio = () => {
    if (audioElement) {
      if (audioPlaying) {
        audioElement.pause();
        setAudioPlaying(false);
      } else {
        audioElement.play();
        setAudioPlaying(true);
      }
    } else {
      gerarAudio();
    }
  };

  // Função para formatar tempo em MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Busca o horóscopo semanal após obter o signo
  useEffect(() => {
    console.log("🔍 Previsão: Verificando signo para buscar horóscopo:", signoUsuario);
    
    if (signoUsuario) {
      console.log("✅ Previsão: Signo válido, buscando horóscopo semanal");
      buscarHoroscopoSemanal(signoUsuario);
    } else {
      console.log("❌ Previsão: Signo não encontrado ou vazio");
    }
  }, [signoUsuario, buscarHoroscopoSemanal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Header user={user} creditos={creditos} />

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <FaStar className="text-purple-500 text-2xl" />
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 font-neue-bold tracking-tight">Previsão da Semana Astrológica</h1>
          </div>
          <div className="text-base sm:text-lg text-purple-500 font-neue text-center max-w-xl">
            O que os astros reservam para você nos próximos dias? <br />
            <span className="text-purple-400">Respira fundo e vem comigo!</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-3xl bg-white/80 p-8 shadow-xl flex flex-col items-center text-purple-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <div className="text-lg font-semibold">Consultando os astros...</div>
            <div className="text-sm text-purple-400">Carregando sua previsão semanal</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-3xl bg-red-100 border border-red-200 p-6 shadow-xl flex flex-col items-center text-red-700">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-lg font-semibold mb-2">Oops! Algo deu errado</div>
            <div className="text-sm text-center mb-4">{error}</div>
            <button 
              onClick={() => signoUsuario && buscarHoroscopoSemanal(signoUsuario)}
              className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Destaque */}
        {destaque && !loading && (
          <div className="rounded-3xl bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 p-6 shadow-xl flex flex-col items-center text-white">
            <div className="flex items-center gap-2 mb-2">
              <GiPlanetConquest className="text-2xl" />
              <span className="text-lg font-semibold">Destaque da semana</span>
            </div>
            <div className="text-xl font-bold mb-1">{destaque.titulo}</div>
            <div className="text-base text-purple-100/90 text-center">{destaque.mensagem}</div>
          </div>
        )}

        {/* Semana */}
        {semana.length > 0 && !loading && (
          <div className="flex flex-col gap-2">
            <div className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <FaStar className="text-purple-400" /> Semana dia a dia
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {semana.map((dia) => (
                <div key={dia.dia} className="min-w-[140px] bg-white/90 rounded-2xl shadow-md p-4 flex flex-col items-center gap-2 border-t-4 border-purple-200">
                  <div className="text-2xl">{iconesMap[dia.icone] || <FaStar className="text-purple-300" />}</div>
                  <div className="font-bold text-purple-700 text-base">{dia.dia}</div>
                  <div className="text-xs text-purple-400 font-semibold mb-1">{dia.tema}</div>
                  <div className="text-xs text-gray-500 text-center">{dia.trecho}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previsão personalizada + Ações */}
        <div className="rounded-2xl bg-white/90 shadow-lg p-6 flex flex-col items-center gap-2 border-l-4 border-purple-300">
          <div className="text-lg font-bold text-purple-700 mb-1">
          Para você, {signoUsuario ? nomesSignos[signoUsuario] || signoUsuario : "..."}
          </div>
          <div className="text-base text-gray-700 text-center mb-2">
            Hora de rever seus planos e se priorizar. Esta semana reserva boas surpresas! 🌟
          </div>
          <button className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition">
            Fazer meu Mapa Astral completo
          </button>
        </div>

        {/* Player de Áudio */}
        {mensagemAudioCatia && (
          <div className="rounded-2xl bg-gradient-to-r from-purple-200 to-blue-200 shadow-lg p-6 flex flex-col items-center gap-3">
            <button 
              onClick={toggleAudio}
              disabled={audioLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {audioLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando áudio...
                </>
              ) : audioPlaying ? (
                <>
                  <div className="w-4 h-4 flex gap-1">
                    <div className="w-1 bg-white rounded-sm"></div>
                    <div className="w-1 bg-white rounded-sm"></div>
                  </div>
                  Pausar áudio da CatIA
                </>
              ) : (
                <>
                  <FaRegPlayCircle className="text-xl" /> 
                  {audioElement ? "Continuar áudio" : "Ouça um recadinho da Catia para essa semana"}
                </>
              )}
            </button>
            
            {/* Barra de progresso */}
            {audioElement && (
              <div className="w-full flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-purple-300 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-purple-500 rounded-full transition-all duration-300" 
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-purple-500">
                  {formatTime(audioElement?.currentTime || 0)} / {formatTime(audioDuration)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 mt-2">
          <button 
            onClick={() => navigate('/diario')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/90 border border-purple-200 text-purple-700 font-bold shadow hover:bg-purple-100 transition"
          >
            <FaRegEdit className="text-lg" /> Quero escrever sobre minha semana
          </button>
        </div>
      </div>
    </div>
  );
}
