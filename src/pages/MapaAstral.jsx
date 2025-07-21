// Página do Mapa Astral do app Universo Catia
// Permite calcular e visualizar o mapa astral baseado em data, hora e local de nascimento

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { loadGoogleMaps } from "../utils/googleMapsLoader";
import { computeBirthChart } from "../utils/calcularMapaAstral";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { AiOutlineArrowLeft } from "react-icons/ai";
import calcularAscendente from '../utils/getAscendente'; // ajuste o caminho conforme sua estrutura


const planetIcons = {
  Sol: "🌞",
  Sun: "🌞",
  Lua: "🌙",
  Moon: "🌙",
  Mercurio: "🪶",
  Mercúrio: "🪶",
  Mercury: "🪶",
  Venus: "💖",
  Vênus: "💖",
  Marte: "🔥",
  Mars: "🔥",
  Jupiter: "⚡",
  Júpiter: "⚡",
  Saturno: "🏛️",
  Saturn: "🏛️",
  Urano: "🌀",
  Uranus: "🌀",
  Netuno: "🌊",
  Neptune: "🌊",
  Plutao: "🪐",
  Plutão: "🪐",
  Pluto: "🪐"
};

const planetNamesPT = {
  Sol: "Sol",
  Sun: "Sol",
  Lua: "Lua",
  Moon: "Lua",
  Mercurio: "Mercúrio",
  Mercúrio: "Mercúrio",
  Mercury: "Mercúrio",
  Venus: "Vênus",
  Vênus: "Vênus",
  Marte: "Marte",
  Mars: "Marte",
  Jupiter: "Júpiter",
  Júpiter: "Júpiter",
  Saturno: "Saturno",
  Saturn: "Saturno",
  Urano: "Urano",
  Uranus: "Urano",
  Netuno: "Netuno",
  Neptune: "Netuno",
  Plutao: "Plutão",
  Plutão: "Plutão",
  Pluto: "Plutão"
};

function CidadeAutocomplete({ value, onChange, onSelect }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

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
          const nome = place.formatted_address || place.name || "";
          onChange(nome);
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
        if (onSelect && e.nativeEvent.inputType) onSelect(null);
      }}
      placeholder={isLoading ? "Carregando..." : "Digite sua cidade..."}
      disabled={isLoading}
      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
      required
      autoComplete="off"
    />
  );
}

// Adiciona um componente de partículas místicas (estrelas)
function MysticParticles() {
  // 12 partículas com posições e delays diferentes
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute bg-white/70 rounded-full shadow-lg"
          style={{
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            filter: 'blur(1px)',
            opacity: 0.18 + Math.random() * 0.12
          }}
          animate={{
            y: [0, -20 - Math.random() * 20, 0],
            opacity: [0.18, 0.28, 0.18]
          }}
          transition={{
            duration: 3.5 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export default function MapaAstral() {
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [cidade, setCidade] = useState("");
  const [coordenadas, setCoordenadas] = useState(null);
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=formulário, 2=resultado, pronto para steps futuros

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!coordenadas) {
        setError("Selecione uma cidade válida no autocomplete.");
        setLoading(false);
        return;
      }
      // Cálculo local dos planetas/casas
      const localDate = new Date(`${birthDate}T${birthTime}`);
      const iso = localDate.toISOString();
      const result = computeBirthChart(iso, parseFloat(coordenadas.lat), parseFloat(coordenadas.lng));

      // Chame a API para obter o ascendente correto
      const timezone = -3; // ajuste conforme necessário
      let ascendenteAPI = null;
      try {
        ascendenteAPI = await calcularAscendente({
          data: birthDate,
          hora: birthTime,
          latitude: coordenadas.lat,
          longitude: coordenadas.lng,
          timezone
        });
      } catch (apiErr) {
        // Se a API falhar, mantém o cálculo local
        console.error('Erro ao buscar ascendente na API:', apiErr);
      }

      setChart({
        ...result,
        ascendant: {
          ...result.ascendant,
          sign: ascendenteAPI && ascendenteAPI.sign ? ascendenteAPI.sign : result.ascendant.sign
        }
      });
      setStep(2);
    } catch (err) {
      setError(err.message);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Header user={user} creditos={creditos} />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mapa Astral</h1>
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
                    setCoordenadas({ lat: info.lat, lng: info.lng });
                  } else {
                    setCoordenadas(null);
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
            className="relative min-h-[90vh] flex flex-col items-center justify-center px-2 py-8 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)', borderRadius: 0 }}
          >
            <MysticParticles />
            <motion.h2
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-8 font-neue-bold drop-shadow-lg tracking-tight z-10"
            >
              Os Astros Revelam Seu Destino
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center text-lg text-purple-100 font-neue mb-4 z-10"
            >
              {formatarDataHora(chart.utc)}<br />
              {cidade}
            </motion.div>
            {/* Linha do signo solar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center mb-2 z-10"
            >
              <span className="block text-white font-bold text-xl sm:text-2xl font-neue-bold drop-shadow-lg">
                Signo: {chart.positions && chart.positions.Sun && chart.positions.Sun.sign ? chart.positions.Sun.sign : 'Desconhecido'}
              </span>
            </motion.div>
            {/* Linha do ascendente */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center mb-8 z-10"
            >
              <span className="block text-white font-bold text-xl sm:text-2xl font-neue-bold drop-shadow-lg">Ascendente: {chart.ascendant.sign}</span>
            </motion.div>
            <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-4 z-10">
              {chart.positions && Object.entries(chart.positions).map(([name, pos], idx) => (
                <motion.div
                  key={name + idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + idx * 0.07, duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col items-center justify-center bg-white/10 rounded-2xl shadow-lg p-4 backdrop-blur-md border border-white/10 hover:bg-white/20 transition font-neue"
                >
                  <span className="text-4xl sm:text-5xl mb-2 drop-shadow-lg">{planetIcons[name] || "🪐"}</span>
                  <span className="text-base font-bold text-white mb-1 tracking-wide">{planetNamesPT[name] || name}</span>
                  <span className="text-purple-200 text-sm font-semibold mb-1">{pos.sign}</span>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(3)}
              className="mt-10 px-8 py-4 rounded-2xl font-bold text-lg bg-pink-500 text-white shadow-xl hover:bg-pink-600 transition font-neue-bold z-10"
              style={{ letterSpacing: 1 }}
            >
              ✨ Ver interpretação
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(1)}
              className="mt-6 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-400 transition font-neue-bold z-10"
              type="button"
            >
              ← Voltar
            </motion.button>
          </motion.div>
        )}
        {/* Step 3: Interpretação do Mapa Astral */}
        {step === 3 && chart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
            className="relative min-h-[90vh] flex flex-col items-center justify-center px-2 py-8 overflow-hidden bg-transparent"
            style={{ borderRadius: 0 }}
          >
            <MysticParticles />
            <div className="w-full max-w-2xl mx-auto flex items-center gap-2 mb-8 z-20">
              <button
                onClick={() => setStep(2)}
                className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
                type="button"
                aria-label="Voltar"
              >
                <AiOutlineArrowLeft size={28} className="text-[#6D28D9] hover:text-purple-800 transition-colors" />
              </button>
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-neue-bold tracking-tight select-none">Seu Universo</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="text-lg sm:text-xl font-bold text-purple-700 text-center mb-8 font-neue tracking-tight z-10"
            >
              Leia seu Mapa Astral abaixo
            </motion.h2>
            <div className="w-full max-w-2xl flex flex-col gap-5 z-10 font-neue">
              {/* Sol */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-purple-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-purple-900 font-bold text-lg mb-1 font-neue-bold">Sua identidade: Sol</div>
                  <div className="text-purple-800 font-neue text-sm mb-2">Essa combinação fala sobre a sua identidade, é aqui que a ficha cai e você percebe de verdade quem se é e o que veio fazer aqui.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-purple-700 font-bold shadow-[0_0_12px_0_rgba(168,139,250,0.25)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-purple-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Lua */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-blue-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-blue-900 font-bold text-lg mb-1 font-neue-bold">Seu emocional: Lua</div>
                  <div className="text-blue-800 font-neue text-sm mb-2">Vida emocional, nossa forma de se expressar e viver do que sentimos. O seu signo lunar revela suas características mais íntimas e seu funcionamento psíquico, descubra o seu neste capítulo.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-blue-700 font-bold shadow-[0_0_12px_0_rgba(139,180,250,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-blue-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Mercúrio */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-green-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-green-900 font-bold text-lg mb-1 font-neue-bold">Intelecto: Mercúrio</div>
                  <div className="text-green-800 font-neue text-sm mb-2">Sua comunicação e criatividade. É aqui que você descobre como funciona seu raciocínio, ao saber o signo e a casa que Mercúrio ocupa em seu mapa.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-green-700 font-bold shadow-[0_0_12px_0_rgba(139,250,180,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-green-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Vênus */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-pink-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-pink-900 font-bold text-lg mb-1 font-neue-bold">Vida afetiva: Vênus</div>
                  <div className="text-pink-800 font-neue text-sm mb-2">Nós amamos e seduzimos segundo o signo em que está Vênus. Enxergamos a beleza da vida e damos valor a ela através desse filtro venusiano.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-pink-700 font-bold shadow-[0_0_12px_0_rgba(250,139,180,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-pink-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Marte */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-red-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-red-900 font-bold text-lg mb-1 font-neue-bold">Força interior: Marte</div>
                  <div className="text-red-800 font-neue text-sm mb-2">Sua força, seu guerreiro interior, a forma como você batalha pelo que quer. Marte é o nosso próprio espírito de luta. Conheça seu guerreiro!</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-red-700 font-bold shadow-[0_0_12px_0_rgba(250,139,139,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-red-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Júpiter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-yellow-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-yellow-900 font-bold text-lg mb-1 font-neue-bold">Oportunidades: Júpiter</div>
                  <div className="text-yellow-800 font-neue text-sm mb-2">O que faz sentido para você? Conhecendo Júpiter no seu mapa você pode entender melhor onde encontrar a felicidade e o significado para sua vida.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-yellow-700 font-bold shadow-[0_0_12px_0_rgba(250,250,139,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-yellow-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Saturno */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-gray-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-gray-900 font-bold text-lg mb-1 font-neue-bold">Desafios: Saturno</div>
                  <div className="text-gray-800 font-neue text-sm mb-2">Saturno é o mestre interior, aquele que traz lições que precisamos aprender para depois ensinar. Mas só podemos ensinar quando aprendemos, o que requer de nós esforço e maturidade.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-gray-700 font-bold shadow-[0_0_12px_0_rgba(180,180,180,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-gray-300">Leia o capítulo</button>
                </div>
              </motion.div>
              {/* Urano, Netuno, Plutão */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
                className="flex items-center bg-gradient-to-r from-purple-100/80 to-white/80 p-5 min-h-[90px] relative overflow-hidden rounded-xl shadow-[0_4px_24px_0_rgba(80,40,120,0.08)] backdrop-blur-md"
              >
                <div className="flex-1">
                  <div className="text-purple-900 font-bold text-lg mb-1 font-neue-bold">Evolução pessoal: Urano, Netuno e Plutão</div>
                  <div className="text-purple-800 font-neue text-sm mb-2">Planetas geracionais que falam sobre evolução coletiva e pessoal. Descubra como essas energias atuam no seu mapa.</div>
                  <button className="mt-2 px-5 py-2 rounded-xl bg-white/90 text-purple-700 font-bold shadow-[0_0_12px_0_rgba(168,139,250,0.18)] hover:bg-white transition font-neue-bold focus:outline-none focus:ring-2 focus:ring-purple-300">Leia o capítulo</button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
  }