// Página do Mapa Astral do app Universo Catia
// Permite calcular e visualizar o mapa astral baseado em data, hora e local de nascimento

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { loadGoogleMaps } from "../utils/googleMapsLoader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import PlanetIcon from "../components/PlanetIcon";
import { getChapterContent } from "../data/astrologyChapters";
import PremiumModal from "../components/PremiumModal";
import { fetchNatalChart } from "../services/astrologyService";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate, useSearchParams } from "react-router-dom";

// Referência neutra para garantir uso de import em ambientes estritos
void motion;

// Emojis removidos – PlanetIcon cobre todos os símbolos

// Mantido para referência futura
// Mapeamentos PT não utilizados foram removidos (mantemos funções para cálculo de signo)

// Função para calcular o dia juliano com maior precisão
// Julian Day utilitário (não utilizado após Swiss Ephemeris)

// Função para determinar o signo baseado no grau eclíptico
// util removido – não usado após Swiss Ephemeris

// Função para normalizar ângulos
// util removido – não usado após Swiss Ephemeris

// Função para converter graus para radianos
// util removido – não usado após Swiss Ephemeris


// Função para calcular posições dos planetas usando VSOP87 corrigido
// Cálculo manual de posições planetárias removido (não utilizado com Swiss Ephemeris)

// Função para calcular o ascendente corrigido
// Ascendente nativo removido; Swiss Ephemeris fornece valor preciso

// Função para obter posições corrigidas baseadas em efemérides precisas

// Função para calcular ascendente específico para São Paulo
// Funções antigas de fallback removidas – Swiss Ephemeris passou a ser a fonte de verdade

// computeBirthChart antigo (API externa) – mantido como comentário de referência
/* async function computeBirthChart(dataHora, latitude, longitude) {
  const data = new Date(dataHora);
  
  // Extrair componentes da data/hora
  const ano = data.getFullYear();
  const mes = data.getMonth() + 1;
  const dia = data.getDate();
  const hora = data.getHours();
  const minuto = data.getMinutes();
  
  // Calcular timezone offset (Brasil = -3)
  const timezoneOffset = -3;
  
  // Preparar dados para a API
  const requestData = {
    day: dia,
    month: mes,
    year: ano,
    hour: hora,
    min: minuto,
    lat: parseFloat(latitude),
    lon: parseFloat(longitude),
    tzone: timezoneOffset
  };
  
  console.log('🔮 Dados enviados para API:', requestData);
  
  try {
    // Chamar a API de astrologia
    const response = await fetch('https://json.freeastrologyapi.com/western/natal-wheel-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 2f6ae2d9-78a7-5a38-86a8-0936bd41339d'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API de astrologia:', response.status, errorText);
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }
    
    const apiData = await response.json();
    console.log('✅ Resposta da API:', apiData);
    
    // Mapear planetas da API para nosso formato
    const planetMapping = {
      'Sun': 'Sol',
      'Moon': 'Lua',
      'Mercury': 'Mercúrio',
      'Venus': 'Vênus',
      'Mars': 'Marte',
      'Jupiter': 'Júpiter',
      'Saturn': 'Saturno',
      'Uranus': 'Urano',
      'Neptune': 'Netuno',
      'Pluto': 'Plutão'
    };
    
    // Extrair posições dos planetas
    const positions = {};
    if (apiData.planets) {
      Object.entries(apiData.planets).forEach(([planet, data]) => {
        const planetName = planetMapping[planet] || planet;
        if (data && data.sign) {
          // Tenta capturar grau dentro do signo (0-30)
          let degInSign = null;
          const candidates = [data.degree, data.deg, data.signDegree, data.sign_degree, data.longitude, data.fullDegree, data.full_degree];
          const firstNum = candidates.find(v => typeof v === 'number');
          if (typeof firstNum === 'number') {
            // Se vier 0-360, normaliza para 0-30 dentro do signo
            degInSign = firstNum > 30 ? (firstNum % 30) : firstNum;
          }
          // Capturar minutos se disponíveis
          let minutes = null;
          const minCandidates = [data.minute, data.minutes, data.min, data.arcMinutes, data.signMinute, data.sign_minute];
          const firstMin = minCandidates.find(v => typeof v === 'number');
          if (typeof firstMin === 'number') minutes = firstMin;
 
          positions[planetName] = { sign: data.sign, degree: degInSign, minutes };
        }
      });
    }
    
    // Extrair ascendente
    const ascendant = apiData.ascendant || apiData.houses?.[0]?.sign || 'Desconhecido';
    
    return {
      utc: data.toISOString(),
      positions,
      ascendant: { sign: ascendant }
    };
    
  } catch (error) {
    console.error('❌ Erro ao calcular mapa astral:', error);
    
    // Fallback para cálculo nativo em caso de erro
    console.log('🔄 Usando cálculo nativo como fallback...');
    
    const dataUTC = new Date(data.getTime() + (3 * 60 * 60 * 1000));
    const jd = calcularDiaJuliano(
      dataUTC.getFullYear(),
      dataUTC.getMonth() + 1,
      dataUTC.getDate(),
      dataUTC.getHours(),
      dataUTC.getMinutes(),
      dataUTC.getSeconds()
    );
    
    const solGrau = calcularPosicaoSol(jd);
    const luaGrau = calcularPosicaoLua(jd);
    const planetas = calcularPosicoesPlanetas(jd);
    const posicoesCorrigidas = obterPosicoesCorrigidas(dataHora, jd);
    const ascendente = calcularAscendenteSaoPaulo(dataHora, latitude, longitude);
    
    return {
      utc: data.toISOString(),
      positions: {
        Sol: { sign: obterSignoPorGrau(solGrau) },
        Lua: { sign: obterSignoPorGrau(luaGrau) },
        Mercúrio: { sign: obterSignoPorGrau(posicoesCorrigidas.mercurio) },
        Vênus: { sign: obterSignoPorGrau(posicoesCorrigidas.venus) },
        Marte: { sign: obterSignoPorGrau(posicoesCorrigidas.marte) },
        Júpiter: { sign: obterSignoPorGrau(planetas.jupiter) },
        Saturno: { sign: obterSignoPorGrau(planetas.saturno) },
        Urano: { sign: obterSignoPorGrau(planetas.urano) },
        Netuno: { sign: obterSignoPorGrau(planetas.netuno) },
        Plutão: { sign: obterSignoPorGrau(planetas.plutao) }
      },
      ascendant: { sign: ascendente }
    };
  }
} */

function CidadeAutocomplete({ value, onChange, onSelect }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastProgrammaticUpdate = useRef(false);
  const selectedNameRef = useRef("");

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        setIsLoading(true);
        await loadGoogleMaps();
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: "br" },
          }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (!place) return;
          const nome = (place.formatted_address || place.name || "").toString();
          lastProgrammaticUpdate.current = true;
          onChange(nome);
          selectedNameRef.current = nome;
          if (place.geometry && place.geometry.location && onSelect) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            onSelect({ nome, lat, lng });
          }
        });
      } catch (error) {
        console.error("Erro ao carregar Google Maps:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAutocomplete();
  }, [onChange, onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => {
        onChange(e.target.value);
        // Só limpa coordenadas se o usuário realmente digitou (não quando o Google preenche)
        const inputType = e?.nativeEvent?.inputType || '';
        const isTyping = inputType.startsWith('insert') || inputType.startsWith('delete');
        if (lastProgrammaticUpdate.current) {
          lastProgrammaticUpdate.current = false; // não limpar ao receber do autocomplete
        } else if (onSelect && isTyping) {
          // Limpa coordenadas somente se o conteúdo divergir do último nome selecionado
          if (e.target.value !== selectedNameRef.current) {
            onSelect(null);
          }
        }
      }}
      placeholder={isLoading ? "Carregando..." : "Digite sua cidade..."}
      disabled={isLoading}
      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
      required
      autoComplete="off"
    />
  );
}

// Teaser curto por planeta para exibir antes do CTA premium
function getPlanetTeaser(planetName) {
  const teaserByPlanet = {
    Sol: "Essa combinação fala sobre a sua identidade, propósito e vitalidade – o ponto onde a ficha cai sobre quem você é.",
    Lua: "Essa combinação fala sobre suas emoções, instintos e necessidades afetivas – o que nutre e acalma seu coração.",
    Mercúrio: "Essa combinação fala sobre sua mente, linguagem e curiosidade – como você pensa, aprende e se expressa.",
    Vênus: "Essa combinação fala sobre seus afetos, estética e valores – o que você ama, deseja e escolhe cultivar.",
    Marte: "Essa combinação fala sobre sua força de ação, coragem e desejo – onde você move montanhas para conquistar.",
    Júpiter: "Essa combinação fala sobre expansão, fé e oportunidades – onde a vida abre caminhos e você cresce.",
    Saturno: "Essa combinação fala sobre estrutura, limites e maturidade – o terreno onde você se torna mais sólido.",
    Urano: "Essa combinação fala sobre mudança, autenticidade e liberdade – sua faísca de inovação e independência.",
    Netuno: "Essa combinação fala sobre sensibilidade, inspiração e intuição – onde você sonha, sente e transcende.",
    Plutão: "Essa combinação fala sobre transformação profunda e poder pessoal – o renascer que te faz mais inteiro.",
  };
  return teaserByPlanet[planetName] || "Essa combinação fala sobre um ponto-chave da sua jornada – aquilo que te move e revela quem você é.";
}

// Componente de partículas místicas aprimorado
function MysticParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(1px)',
            opacity: 0.1 + Math.random() * 0.2
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Componente do mapa circular das casas astrológicas
function AstralWheel({ chart, onPlanetClick }) {
  const houses = [
    "1ª Casa - Ascendente", "2ª Casa", "3ª Casa", "4ª Casa", 
    "5ª Casa", "6ª Casa", "7ª Casa", "8ª Casa", 
    "9ª Casa", "10ª Casa", "11ª Casa", "12ª Casa"
  ];

  // Lista de planetas (referência para loops/ordenação futura)

  // Cálculo de posicionamento tipo “mandala”, evitando sobreposição
  function getAngleForPlanet(planetName) {
    const pos = chart?.positions?.[planetName];
    if (!pos) return 0;
    const signIndex = getSignIndex(pos.sign);
    const deg = typeof pos.degree === 'number' ? Math.max(0, Math.min(29.99, pos.degree)) : 15; // centro do signo se grau ausente
    return signIndex * 30 + deg; // 0-360
  }

  function computePlacements() {
    const planetNames = Object.keys(chart?.positions || {});
    const entries = planetNames.map(name => ({ name, angle: getAngleForPlanet(name) })).sort((a,b)=>a.angle-b.angle);
    const lanes = []; // cada lane: [{angle}]
    const MIN_SEP = 8; // graus mínimos para não colidir na mesma faixa
    const BASE_R = 100;
    const STEP = 10;
    return entries.map((p) => {
      let laneIndex = 0;
      while (true) {
        if (!lanes[laneIndex]) lanes[laneIndex] = [];
        const hasConflict = lanes[laneIndex].some(other => Math.abs(other.angle - p.angle) < MIN_SEP);
        if (!hasConflict) {
          lanes[laneIndex].push({ angle: p.angle });
          const radius = BASE_R + laneIndex * STEP;
          return { ...p, radius };
        }
        laneIndex += 1;
      }
    });
  }

  const placements = computePlacements();

  // getHouseFor removida (usamos função local na renderização da tabela)

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Círculo externo - Casas */}
      <div className="relative w-80 h-80 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          {/* Casas */}
          {houses.map((house, index) => {
            const angle = (index * 30) * (Math.PI / 180);
            const x = 150 + 120 * Math.cos(angle);
            const y = 150 + 120 * Math.sin(angle);
            
            return (
              <g key={house}>
                <text
                  x={x}
                  y={y}
                  className="text-xs font-bold fill-purple-800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${index * 30 + 90}, ${x}, ${y})`}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
          
          {/* Círculos das casas (refinados) */}
          <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.5"/>
          <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1"/>
          <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8"/>
          
          {/* Linhas das casas */}
          {houses.map((_, index) => {
            const angle = (index * 30) * (Math.PI / 180);
            const x1 = 150 + 80 * Math.cos(angle);
            const y1 = 150 + 80 * Math.sin(angle);
            const x2 = 150 + 120 * Math.cos(angle);
            const y2 = 150 + 120 * Math.sin(angle);
            
            return (
              <line
                key={`house-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="0.8"
              />
            );
          })}
        </svg>
        
        {/* Planetas posicionados */}
        {placements.map((p, index) => {
          const angleRad = (p.angle) * (Math.PI / 180);
          const x = 150 + p.radius * Math.cos(angleRad);
          const y = 150 + p.radius * Math.sin(angleRad);
          
          return (
            <motion.div
              key={p.name}
              className={`absolute w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer hover:scale-110 transition-transform`}
              style={{
                left: `${(x / 300) * 100}%`,
                top: `${(y / 300) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0.8, x: Math.cos(angleRad) * 30, y: Math.sin(angleRad) * 30 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05 * index, ease: 'easeOut' }}
              onClick={(e) => {
                const parent = e.currentTarget.parentElement?.getBoundingClientRect();
                const rect = e.currentTarget.getBoundingClientRect();
                const left = rect.left - (parent?.left || 0) + rect.width / 2;
                const top = rect.top - (parent?.top || 0) + rect.height / 2;
                onPlanetClick(p.name, { left, top });
              }}
            >
              <PlanetIcon name={p.name} size={22} className="text-yellow-300" />
            </motion.div>
          );
        })}
      </div>
      
      {/* Legenda removida */}
    </div>
  );
}

// Função auxiliar para obter índice do signo
function getSignIndex(signName) {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  return signs.indexOf(signName);
}

// Função para gerar interpretações dos planetas
function getPlanetInterpretation(planetName, signName) {
  const interpretations = {
    Sol: {
      "Áries": "Você é uma pessoa naturalmente líder, cheia de energia e iniciativa. Sua identidade está ligada à coragem e à capacidade de iniciar novos projetos. Você brilha quando pode ser pioneiro e inspirar outros com sua determinação.",
      "Touro": "Sua essência está na estabilidade e na busca por segurança. Você é prático, paciente e tem uma forte conexão com o mundo material. Sua identidade se expressa através da construção de uma base sólida para sua vida.",
      "Gêmeos": "Você é comunicativo, curioso e versátil. Sua identidade se manifesta através da troca de ideias e da busca por conhecimento. Você brilha quando pode conectar pessoas e informações de diferentes formas.",
      "Câncer": "Sua essência está na sensibilidade e na proteção. Você é emocionalmente intuitivo e tem uma forte conexão com família e lar. Sua identidade se expressa através do cuidado e da criação de um ambiente acolhedor.",
      "Leão": "Você é carismático, criativo e naturalmente magnético. Sua identidade está ligada à expressão artística e à capacidade de inspirar outros. Você brilha quando pode ser o centro das atenções e compartilhar sua criatividade.",
      "Virgem": "Sua essência está na perfeição e no serviço aos outros. Você é analítico, organizado e tem uma forte ética de trabalho. Sua identidade se expressa através da melhoria constante e da ajuda prática.",
      "Libra": "Você é diplomático, justo e busca harmonia em tudo. Sua identidade está ligada ao equilíbrio e à capacidade de ver diferentes perspectivas. Você brilha quando pode mediar conflitos e criar beleza.",
      "Escorpião": "Sua essência está na intensidade e na transformação. Você é intuitivo, determinado e tem uma capacidade única de penetrar na verdade. Sua identidade se expressa através da profundidade emocional e do poder de regeneração.",
      "Sagitário": "Você é otimista, aventureiro e busca expandir seus horizontes. Sua identidade está ligada à sabedoria e à busca por significado. Você brilha quando pode explorar novos territórios e compartilhar sua filosofia de vida.",
      "Capricórnio": "Sua essência está na ambição e na responsabilidade. Você é disciplinado, paciente e tem uma forte ética de trabalho. Sua identidade se expressa através da conquista de objetivos e da construção de legado.",
      "Aquário": "Você é inovador, humanitário e pensa fora da caixa. Sua identidade está ligada à originalidade e à busca por progresso social. Você brilha quando pode revolucionar ideias e conectar-se com grupos.",
      "Peixes": "Sua essência está na compaixão e na espiritualidade. Você é intuitivo, empático e tem uma forte conexão com o universo. Sua identidade se expressa através da sensibilidade artística e da busca por transcendência."
    },
    Lua: {
      "Áries": "Emocionalmente, você é impulsivo e reage rapidamente aos estímulos. Precisa de independência emocional e pode ser temperamental quando se sente restrito.",
      "Touro": "Você busca estabilidade emocional e conforto. É leal e paciente, mas pode ser teimoso quando se sente ameaçado emocionalmente.",
      "Gêmeos": "Suas emoções são versáteis e você precisa de variedade mental. Pode ter mudanças de humor rápidas e busca comunicação emocional.",
      "Câncer": "Você é profundamente emocional e intuitivo. Tem forte conexão com família e memórias, sendo muito protetor com quem ama.",
      "Leão": "Suas emoções são dramáticas e você busca reconhecimento afetivo. É generoso emocionalmente e precisa de admiração.",
      "Virgem": "Você analisa suas emoções e busca perfeição emocional. Pode ser crítico consigo mesmo e com outros em questões afetivas.",
      "Libra": "Busca harmonia emocional e pode ter dificuldade com conflitos. É diplomático e precisa de relacionamentos equilibrados.",
      "Escorpião": "Suas emoções são intensas e profundas. Você é leal e protetor, mas pode ser ciumento e vingativo quando ferido.",
      "Sagitário": "Você é otimista emocionalmente e busca liberdade afetiva. Pode ser impaciente com limitações emocionais.",
      "Capricórnio": "Você controla suas emoções e pode parecer reservado. É leal e responsável, mas pode ter dificuldade para expressar sentimentos.",
      "Aquário": "Suas emoções são independentes e você valoriza liberdade afetiva. Pode parecer distante, mas é leal aos amigos.",
      "Peixes": "Você é extremamente sensível e empático. Pode absorver emoções alheias e tem forte intuição emocional."
    }
  };

  return interpretations[planetName]?.[signName] || 
    `Como ${planetName} em ${signName}, você tem características únicas que se manifestam de forma especial em sua personalidade. Esta combinação cria um perfil astrológico único e interessante.`;
}

export default function MapaAstral() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [cidade, setCidade] = useState("");
  const [coordenadas, setCoordenadas] = useState(null);
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === '3') return 3;
    const savedChart = typeof window !== 'undefined' ? localStorage.getItem('mapAstralChart') : null;
    return savedChart ? 2 : 1;
  }); // 1=formulário, 2=casas astrológicas, 3=significados
  // Mantido para futura navegação detalhada (usado no botão "Ver leitura completa")
  // Seleção opcional para futuras navegações; pode ficar null sem uso imediato
  // Sem estado de seleção explícito por enquanto; usamos tooltip/step diretamente
  const [isPremium, setIsPremium] = useState(false);
  const coordenadasRef = useRef(null);
  const [planetTooltip, setPlanetTooltip] = useState(null); // { left, top, title, text }
  const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);
  const openPremiumModal = () => setPremiumModalOpen(true);
  const closePremiumModal = () => setPremiumModalOpen(false);
  const handleSubscribe = () => {
    // TODO: integrar com fluxo real de pagamento/checkout
    setPremiumModalOpen(false);
  };

  // Ao entrar na tela de interpretação completa, rolar para o topo
  useEffect(() => {
    if (step === 3) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Recuperar dados salvos do localStorage se step=3 e não há chart
  useEffect(() => {
    if (step === 3 && !chart) {
      const savedChart = localStorage.getItem('mapAstralChart');
      const savedCidade = localStorage.getItem('mapAstralCidade');
      if (savedChart) {
        setChart(JSON.parse(savedChart));
        if (savedCidade) setCidade(savedCidade);
      } else {
        // Se não há dados salvos, volta para o formulário
        setStep(1);
      }
    }
  }, [step, chart]);

  // Garantir que, ao abrir no step 2 sem chart, tentamos carregar do localStorage
  useEffect(() => {
    if (step === 2 && !chart) {
      const raw = localStorage.getItem('mapAstralChart');
      const savedCidade = localStorage.getItem('mapAstralCidade');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.positions) {
            setChart(parsed);
            if (savedCidade) setCidade(savedCidade);
          } else {
            localStorage.removeItem('mapAstralChart');
          }
        } catch {
          localStorage.removeItem('mapAstralChart');
        }
      }
    }
  }, [step, chart]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCreditos(userData.creditos || 0);
          setIsPremium(userData.isPremium || userData.plano === 'premium' || userData.subscription?.active);
        } else {
          setCreditos(0);
          setIsPremium(false);
        }
      } else {
        setCreditos(0);
        setIsPremium(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect separado para carregar mapa astral salvo
  useEffect(() => {
    const loadSavedChart = async () => {
      if (!user) return;
      
      const stepParam = searchParams.get('step');
      // Só carrega se não há step na URL e não há chart atual
      if (!stepParam && !chart) {
        try {
          const mapaRef = doc(db, "mapas_astrais", user.uid);
          const mapaSnap = await getDoc(mapaRef);
          if (mapaSnap.exists()) {
            const mapaData = mapaSnap.data();
            console.log('📖 Carregando mapa astral salvo do Firebase');
            
            // Restaurar dados do formulário
            setBirthDate(mapaData.birthDate || '');
            setBirthTime(mapaData.birthTime || '');
            setCidade(mapaData.cidade || '');
            setCoordenadas(mapaData.coordenadas || null);
            setChart(mapaData.chart || null);
            
            // Ir direto para visualização se há chart
            if (mapaData.chart) {
              setStep(2);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao carregar mapa astral:', error);
        }
      }
    };

    loadSavedChart();
  }, [user, searchParams, chart]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Antes de submeter, se o valor do input é exatamente o último selecionado, garanta que coordenadasRef esteja populada
    if (!coordenadasRef.current && cidade && cidade === (document?.activeElement?.value || cidade)) {
      // não faz nada; fallback permanece
    }
    setLoading(true);
    setError(null);
    try {
      const coords = coordenadasRef.current || coordenadas;
      if (!coords) {
        setError("Selecione uma cidade válida no autocomplete.");
        setLoading(false);
        return;
      }

      // Antes de chamar a API, salva um rascunho (inputs validados) no Firebase
      if (user) {
        try {
          await setDoc(
            doc(db, "mapas_astrais", user.uid),
            {
              birthDate,
              birthTime,
              cidade,
              coordenadas: coords,
              timezone: 'America/Sao_Paulo',
              status: 'pending',
              updatedAt: new Date(),
            },
            { merge: true }
          );
        } catch (errDraft) {
          console.error('❌ Erro ao salvar rascunho do mapa astral:', errDraft);
        }
      }

      // Novo: usa serviço preciso (Swiss Ephemeris / Plácidus)
      const dataHoraLocal = `${birthDate}T${birthTime}:00`;
      const natal = await fetchNatalChart({
        dateISO: dataHoraLocal,
        timezone: 'America/Sao_Paulo',
        latitude: parseFloat(coords.lat),
        longitude: parseFloat(coords.lng),
      });

      const positions = {};
      (natal.planetas || []).forEach((p) => {
        positions[p.nome] = {
          sign: p.signo,
          degree: p.grau,
          casa: p.casa,
        };
      });

      const result = {
        positions,
        houses: natal.casas || [],
        ascendant: natal.ascendant, // ✅ Reativado - AstrologyAPI funcionando
        utc: natal.utc, // ✅ Incluir data/hora para exibição
      };

      setChart(result);
      // Salvar dados no localStorage para persistir entre sessões/abas
      localStorage.setItem('mapAstralChart', JSON.stringify(result));
      localStorage.setItem('mapAstralCidade', cidade);
      
      // Salvar/atualizar mapa astral no Firebase para experiência persistente
      if (user) {
        try {
          await setDoc(
            doc(db, "mapas_astrais", user.uid),
            {
              birthDate,
              birthTime,
              cidade,
              coordenadas: coords,
              timezone: 'America/Sao_Paulo',
              chart: result,
              status: 'ready',
              updatedAt: new Date(),
            },
            { merge: true }
          );
          console.log('✅ Mapa astral salvo no Firebase');
        } catch (error) {
          console.error('❌ Erro ao salvar mapa astral:', error);
        }
      }
      
      setStep(2);
    } catch (err) {
      console.error('❌ Erro no handleSubmit:', err);
      // Atualiza status de erro no documento, mantendo os inputs salvos
      if (user) {
        try {
          await setDoc(
            doc(db, "mapas_astrais", user.uid),
            { status: 'error', errorMessage: String(err?.message || err), updatedAt: new Date() },
            { merge: true }
          );
        } catch (errStatus) {
          console.error('❌ Erro ao atualizar status de erro no Firebase:', errStatus);
        }
      }
      setError(err.message || "Erro ao calcular mapa astral. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Função para formatar data e hora no padrão brasileiro
  function formatarDataHora(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

    return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(1600px 900px at 20% -10%, rgba(111,66,193,0.15), transparent), radial-gradient(1400px 800px at 120% 110%, rgba(0,119,255,0.12), transparent), linear-gradient(135deg, #140c2e 0%, #1d0f3f 55%, #090d1a 100%)',
      }}
    >
      <Header user={user} creditos={creditos} isWhiteText={true} />
      <div className={`${step === 1 ? 'max-w-md mx-auto p-4' : 'w-full p-0'}`}>
        <h1 className="text-2xl font-bold mb-4 text-white px-4 sm:px-6 md:px-8">Mapa Astral</h1>
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white/80 rounded-2xl shadow-lg p-6 mb-4">
            <div>
              <label className="block text-purple-700 font-semibold mb-1 font-neue-bold">Data de nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800"
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-purple-700 font-semibold mb-1 font-neue-bold">Hora de nascimento</label>
              <input
                type="time"
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800"
              />
            </div>
            <div>
              <label className="block text-purple-700 font-semibold mb-1 font-neue-bold">Cidade de nascimento</label>
              <CidadeAutocomplete
                value={cidade}
                onChange={setCidade}
                onSelect={info => {
                  if (info && info.lat && info.lng) {
                    const c = { lat: info.lat, lng: info.lng };
                    setCoordenadas(c);
                    coordenadasRef.current = c;
                  } else {
                    setCoordenadas(null);
                    coordenadasRef.current = null;
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-lg transition shadow bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-200 disabled:text-purple-400 disabled:cursor-not-allowed"
            >
              {loading ? "Calculando..." : "Calcular"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        )}
        {step === 2 && chart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-10 overflow-hidden"
            style={{ background: 'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,0.08), transparent), radial-gradient(1000px 500px at 80% 90%, rgba(255,215,0,0.08), transparent), linear-gradient(135deg, #1b1038 0%, #2c164d 60%, #0e1b3d 100%)' }}
          >
            <MysticParticles />
            {/* Névoa cósmica sutil (sem caixas/retângulos) */}
            <div className="absolute -top-32 -left-32 w-[50rem] h-[50rem] bg-purple-700/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[46rem] h-[46rem] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center z-10 pt-14 pb-10 sm:pt-20 sm:pb-14"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-wide leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
                ✨ O Céu no momento em que você nasceu
              </h2>
              <p className="text-purple-100/90 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                Em {formatarDataHora(chart.utc)} em {cidade || 'sua cidade'}, o universo desenhou seu código cósmico. Cada planeta ocupava uma posição única. Agora, você pode decifrá-lo.
              </p>
            </motion.div>

            {/* Mapa Circular */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="z-10"
            >
              <AstralWheel 
                chart={chart}
                onPlanetClick={(planetName, pos) => {
                  const sign = chart.positions?.[planetName]?.sign;
                  const snippet = getPlanetInterpretation(planetName, sign) || '';
                  const firstSentence = snippet.split('.').filter(Boolean)[0] || snippet;
                  setPlanetTooltip({
                    left: pos.left,
                    top: pos.top,
                    title: `${planetName} em ${sign}`,
                    text: firstSentence
                  });
                }}
              />
            </motion.div>

            {/* Informações principais (3 cards na mesma linha) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 text-center z-10"
            >
              <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-6xl w-full mx-auto">
                {/* Card Signo Solar */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 border border-white/20">
                  <span className="text-purple-200 text-xs sm:text-sm font-medium">Signo Solar</span>
                  <p className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl mt-1 sm:mt-2">
                    {chart.positions?.Sol?.sign || 'Desconhecido'}
                  </p>
                  <p className="text-purple-100/80 text-xs mt-1 sm:mt-2">
                    Sua essência
                  </p>
                </div>



                {/* Card Ascendente */}
                {chart.ascendant && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 border border-white/20">
                    <span className="text-purple-200 text-xs sm:text-sm font-medium">Ascendente</span>
                    <p className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl mt-1 sm:mt-2">
                      {chart.ascendant.sign}
                    </p>
                    <p className="text-purple-100/80 text-xs mt-1 sm:mt-2">
                      Sua imagem
                    </p>
                  </div>
                )}


               {/* Card Lua */}
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 border border-white/20">
                  <span className="text-purple-200 text-xs sm:text-sm font-medium">Signo Lunar</span>
                  <p className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl mt-1 sm:mt-2">
                    {chart.positions?.Lua?.sign || 'Desconhecido'}
                  </p>
                  <p className="text-purple-100/80 text-xs mt-1 sm:mt-2">
                    Suas emoções
                  </p>
                </div>


              </div>
            </motion.div>

            {/* Tooltip do planeta */}
            {planetTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-20 max-w-xs"
                style={{ left: planetTooltip.left, top: planetTooltip.top, transform: 'translate(-50%, -110%)' }}
              >
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-xl p-4">
          <div className="text-sm font-semibold mb-1">{planetTooltip.title}</div>
          <div className="text-xs text-white/80 mb-1">Casa: em breve • Interpretação breve abaixo</div>
          <div className="text-sm text-white/90">{planetTooltip.text}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setPlanetTooltip(null)}
                      className="px-3 py-1 text-xs bg-white/15 hover:bg-white/25 rounded-lg border border-white/20"
                    >Fechar</button>
                    <button
                      onClick={() => { setStep(3); }}
                      className="px-3 py-1 text-xs bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500"
                    >Ver leitura completa</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tabela de posições ACIMA dos cards de destaque */}
            <div className="z-10 mt-10 w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 text-xs sm:text-sm text-white/85 px-6 py-3 bg-white/5 text-center">
                <div className="font-semibold">Planeta</div>
                <div className="font-semibold">Signo</div>
                <div className="font-semibold">Casa</div>
              </div>
              <div className="divide-y divide-white/10">
                {Object.entries(chart.positions || {}).map(([planetName, pos]) => {
                  const house = pos.sign ? (function(sign, degree){
                    const ascSign = chart?.ascendant?.sign || 'Áries';
                    const ascIndex = getSignIndex(ascSign);
                    const ascBase = Math.max(0, ascIndex) * 30;
                    const planetIndex = getSignIndex(sign);
                    const d = typeof degree === 'number' ? degree : 15;
                    const planetDeg = planetIndex * 30 + d;
                    const delta = ((planetDeg - ascBase) + 360) % 360;
                    return Math.floor(delta / 30) + 1;
                  })(pos.sign, pos.degree) : null;
                  return (
                    <div key={planetName} className="grid grid-cols-3 items-center px-6 py-3 sm:py-4 text-white/90 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                          <span className="scale-95"><PlanetIcon name={planetName} size={18} /></span>
                        </div>
                        {/* Removido o nome do planeta */}
                      </div>
                      <div className="text-white/90">{pos.sign || '—'}</div>
                      <div className="text-white/90">{house || '—'}</div>
                    </div>
                  );
                })}
                {/* Ascendente */}
                {chart.ascendant && (
                  <div className="grid grid-cols-3 items-center px-6 py-3 sm:py-4 text-white/90 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-xs">Asc</span>
                      </div>
                    </div>
                    <div>{chart.ascendant.sign}</div>
                    <div>1</div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 z-10"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
                className="px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl hover:from-pink-600 hover:to-purple-700 transition font-neue-bold"
              >
                ✨ Ver Interpretação Completa
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Limpar dados para nova consulta
                  setBirthDate('');
                  setBirthTime('');
                  setCidade('');
                  setCoordenadas(null);
                  setChart(null);
                  setError(null);
                  localStorage.removeItem('mapAstralChart');
                  localStorage.removeItem('mapAstralCidade');
                  setStep(1);
                }}
                className="px-6 py-4 rounded-2xl font-bold text-lg bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition font-neue-bold"
              >
                ← Nova Consulta
              </motion.button>
            </motion.div>

            {/* Tabela de posições (única) - removida duplicata abaixo */}

            {/* Indicador de premium removido nesta tela */}
          </motion.div>
        )}
        {/* Step 3: Interpretação do Mapa Astral */}
        {step === 3 && chart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
            className="relative min-h-screen bg-gradient-to-br from-slate-50 to-purple-50"
          >
            <MysticParticles />
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-purple-100">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStep(2)}
                      className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
                    >
                      <AiOutlineArrowLeft size={20} className="text-purple-700" />
                    </motion.button>
                    <div>
                      <h1 className="text-xl font-bold text-purple-900 font-neue-bold">
                        Interpretação Astrológica
                      </h1>
                      <p className="text-sm text-purple-600">
                        {chart.positions?.Sol?.sign} • {formatarDataHora(chart.utc)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tag Premium removida conforme solicitação */}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* Resumo do Mapa */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-4 font-neue-bold">
                    Seu Perfil Astrológico
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-purple-200 text-sm">Signo Solar</span>
                      <p className="text-xl font-bold">{chart.positions?.Sol?.sign}</p>
                    </div>
                    {chart.ascendant && (
                      <div>
                        <span className="text-purple-200 text-sm">Ascendente</span>
                        <p className="text-xl font-bold">{chart.ascendant.sign}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-purple-200 text-sm">Signo Lunar</span>
                      <p className="text-xl font-bold">{chart.positions?.Lua?.sign}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Interpretações dos Planetas */}
              <div className="space-y-6">
                {Object.entries(chart.positions).map(([planetName, position], index) => {
                  const planetConfig = {
                    Sol: { 
                      title: "Sua Essência", 
                      subtitle: "Identidade e Propósito",
                      color: "from-yellow-400 to-orange-500",
                      bgColor: "from-yellow-50 to-orange-50",
                      textColor: "text-yellow-900",
                      icon: "🌞"
                    },
                    Lua: { 
                      title: "Seu Emocional", 
                      subtitle: "Mundo Interior e Intuição",
                      color: "from-blue-400 to-indigo-500",
                      bgColor: "from-blue-50 to-indigo-50",
                      textColor: "text-blue-900",
                      icon: "🌙"
                    },
                    Mercúrio: { 
                      title: "Seu Intelecto", 
                      subtitle: "Comunicação e Raciocínio",
                      color: "from-green-400 to-emerald-500",
                      bgColor: "from-green-50 to-emerald-50",
                      textColor: "text-green-900",
                      icon: "🪶"
                    },
                    Vênus: { 
                      title: "Seu Amor", 
                      subtitle: "Afetividade e Beleza",
                      color: "from-pink-400 to-rose-500",
                      bgColor: "from-pink-50 to-rose-50",
                      textColor: "text-pink-900",
                      icon: "💖"
                    },
                    Marte: { 
                      title: "Sua Força", 
                      subtitle: "Energia e Ação",
                      color: "from-red-400 to-red-600",
                      bgColor: "from-red-50 to-red-100",
                      textColor: "text-red-900",
                      icon: "🔥"
                    },
                    Júpiter: { 
                      title: "Sua Expansão", 
                      subtitle: "Sabedoria e Oportunidades",
                      color: "from-purple-400 to-violet-500",
                      bgColor: "from-purple-50 to-violet-50",
                      textColor: "text-purple-900",
                      icon: "⚡"
                    },
                    Saturno: { 
                      title: "Seus Desafios", 
                      subtitle: "Lições e Crescimento",
                      color: "from-gray-400 to-gray-600",
                      bgColor: "from-gray-50 to-gray-100",
                      textColor: "text-gray-900",
                      icon: "🏛️"
                    },
                    Urano: { 
                      title: "Sua Inovação", 
                      subtitle: "Revolução e Originalidade",
                      color: "from-cyan-400 to-blue-500",
                      bgColor: "from-cyan-50 to-blue-50",
                      textColor: "text-cyan-900",
                      icon: "🌀"
                    },
                    Netuno: { 
                      title: "Sua Espiritualidade", 
                      subtitle: "Intuição e Transcendência",
                      color: "from-indigo-400 to-purple-500",
                      bgColor: "from-indigo-50 to-purple-50",
                      textColor: "text-indigo-900",
                      icon: "🌊"
                    },
                    Plutão: { 
                      title: "Sua Transformação", 
                      subtitle: "Poder e Renascimento",
                      color: "from-purple-600 to-black",
                      bgColor: "from-purple-100 to-gray-100",
                      textColor: "text-purple-900",
                      icon: "🪐"
                    }
                  };

                  const config = planetConfig[planetName] || {
                    title: planetName,
                    subtitle: "Planeta",
                    color: "from-gray-400 to-gray-600",
                    bgColor: "from-gray-50 to-gray-100",
                    textColor: "text-gray-900",
                    icon: "🪐"
                  };

                  return (
                    <motion.div
                      key={planetName}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                      className={`bg-gradient-to-r ${config.bgColor} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${config.textColor} font-neue-bold`}>
                              {config.title}
                            </h3>
                            <span className="text-sm bg-white/70 px-3 py-1 rounded-full font-medium">
                              {position.sign}
                            </span>
                          </div>
                          <p className={`text-sm ${config.textColor} opacity-80 mb-4`}>
                            {config.subtitle}
                          </p>
                          
                          {isPremium ? (
                            <div className="space-y-3">
                              <p className="text-gray-700 leading-relaxed">
                                {getPlanetInterpretation(planetName, position.sign)}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/mapa-astral/capitulo/${encodeURIComponent(planetName)}/${encodeURIComponent(position.sign)}`)}
                                  className="px-4 py-2 bg-white/80 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors"
                                >
                                  📖 Ler mais
                                </button>
                              </div>
                            </div>
                           ) : (
                             <div className="mt-2 space-y-3">
                               {(() => {
                                 const chapter = getChapterContent(planetName, position.sign);
                                 return (
                                   <div>
                                     <h4 className={`text-base font-bold ${config.textColor} font-neue-bold`}>{chapter?.title || config.title}</h4>
                                     <p className={`text-sm ${config.textColor} opacity-80`}>{chapter?.teaser || getPlanetTeaser(planetName)}</p>
                                   </div>
                                 );
                               })()}
                               <p className={`text-sm ${config.textColor} opacity-80`}>
                                 Para ler o capítulo completo desta interpretação e receber orientações
                                 personalizadas, desbloqueie com o <span className="font-semibold">Premium</span>.
                               </p>
                               <button
                                 onClick={openPremiumModal}
                                 aria-label="Desbloquear capítulo completo no Premium"
                                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-md hover:from-yellow-600 hover:to-orange-600 active:scale-95 transition"
                               >
                                 <span>🌟</span>
                                 <span>Desbloquear capítulo completo</span>
                               </button>
                               <div className={`text-[11px] ${config.textColor} opacity-60`}>
                                 Acesso imediato. Cancele quando quiser.
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Call to Action removido nesta tela */}
            </div>
          </motion.div>
        )}
      {/* Modal de Pagamento Premium */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={closePremiumModal}
        onSubscribe={handleSubscribe}
      />
      </div>
    </div>
  );
  }