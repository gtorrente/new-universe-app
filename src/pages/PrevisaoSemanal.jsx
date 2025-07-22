import { useState, useEffect } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { FaStar, FaRegPlayCircle, FaRegEdit, FaRegHeart } from 'react-icons/fa';
import { BsFillSunFill, BsFillMoonStarsFill } from 'react-icons/bs';
import { GiPlanetConquest } from 'react-icons/gi';

const icones = {
  "Intuição": <BsFillMoonStarsFill className="text-blue-400" />,
  "Movimento": <GiPlanetConquest className="text-purple-400" />,
  "Oportunidade": <FaStar className="text-yellow-400" />,
  "Expansão": <BsFillSunFill className="text-orange-400" />,
  "Afeto": <FaRegHeart className="text-pink-400" />,
  "Reflexão": <FaRegEdit className="text-green-400" />,
  "Descanso": <FaStar className="text-indigo-400" />
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

export default function PrevisaoSemanal() {
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [signoUsuario, setSignoUsuario] = useState(null);
  const [destaque, setDestaque] = useState(null);
  const [semana, setSemana] = useState([]);

  // Recupera usuário + dados do Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const dados = userSnap.data();
          setCreditos(dados.creditos || 0);
          setSignoUsuario((dados.sign || "").toLowerCase());
        } else {
          setCreditos(0);
        }
      } else {
        setCreditos(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Busca o horóscopo semanal após obter o signo
  useEffect(() => {
    if (!signoUsuario) return;

    async function buscarHoroscopoSemanal() {
      try {
        const res = await fetch("https://81dbde66ca8f.ngrok-free.app/horoscopo-semanal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sign: signoUsuario })
        });

        const data = await res.json();
        setDestaque(data.destaque);
        setSemana([
          { dia: "Seg", ...data.semana.segunda },
          { dia: "Ter", ...data.semana.terca },
          { dia: "Qua", ...data.semana.quarta },
          { dia: "Qui", ...data.semana.quinta },
          { dia: "Sex", ...data.semana.sexta },
          { dia: "Sáb", ...data.semana.sabado },
          { dia: "Dom", ...data.semana.domingo }
        ]);
      } catch (err) {
        console.error("Erro ao buscar horóscopo semanal:", err);
      }
    }

    buscarHoroscopoSemanal();
  }, [signoUsuario]);

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

        {/* Destaque */}
        {destaque && (
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
        {semana.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <FaStar className="text-purple-400" /> Semana dia a dia
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {semana.map((dia) => (
                <div key={dia.dia} className="min-w-[140px] bg-white/90 rounded-2xl shadow-md p-4 flex flex-col items-center gap-2 border-t-4 border-purple-200">
                  <div className="text-2xl">{icones[dia.tema] || <FaStar className="text-purple-300" />}</div>
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

        {/* Player e Diário */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-200 to-blue-200 shadow-lg p-6 flex flex-col items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">
            <FaRegPlayCircle className="text-xl" /> Ouvir a previsão da semana com a voz da CatIA
          </button>
          <div className="w-full flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-purple-300 rounded-full overflow-hidden">
              <div className="h-2 bg-purple-500 rounded-full animate-pulse" style={{ width: '40%' }}></div>
            </div>
            <span className="text-xs text-purple-500">00:42</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mt-2">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/90 border border-purple-200 text-purple-700 font-bold shadow hover:bg-purple-100 transition">
            <FaRegEdit className="text-lg" /> Quero escrever sobre minha semana
          </button>
        </div>
      </div>
    </div>
  );
}
