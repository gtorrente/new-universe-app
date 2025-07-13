// Página de Previsão Semanal do app Universo Catia
// Exibe previsões astrológicas personalizadas para a semana com integração ao diário

import { useState, useEffect } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { FaStar, FaRegPlayCircle, FaRegEdit, FaRegHeart } from 'react-icons/fa';
import { BsFillSunFill, BsFillMoonStarsFill } from 'react-icons/bs';
import { GiPlanetConquest } from 'react-icons/gi';

// Dados dos dias da semana com ícones e dicas
const diasSemana = [
  { dia: "Seg", icone: <BsFillMoonStarsFill className="text-blue-400" />, palavra: "Intuição", dica: "Confie no seu sexto sentido hoje." },
  { dia: "Ter", icone: <GiPlanetConquest className="text-purple-400" />, palavra: "Movimento", dica: "Aja com coragem, mesmo que seja um pequeno passo." },
  { dia: "Qua", icone: <FaStar className="text-yellow-400" />, palavra: "Oportunidade", dica: "Observe sinais e esteja aberta a novidades." },
  { dia: "Qui", icone: <BsFillSunFill className="text-orange-400" />, palavra: "Expansão", dica: "Busque aprender algo novo, nem que seja pequeno." },
  { dia: "Sex", icone: <FaRegHeart className="text-pink-400" />, palavra: "Afeto", dica: "Demonstre carinho para alguém especial." },
  { dia: "Sáb", icone: <FaRegEdit className="text-green-400" />, palavra: "Reflexão", dica: "Reserve um tempo para você e seus sonhos." },
  { dia: "Dom", icone: <FaStar className="text-indigo-400" />, palavra: "Descanso", dica: "Permita-se relaxar e recarregar as energias." },
];

// Previsões simuladas por signo do zodíaco
const previsoesSimuladas = {
  "Áries": "Semana de energia e iniciativa. Aproveite para começar novos projetos!",
  "Touro": "Foque no autocuidado e na estabilidade. Boas oportunidades financeiras à vista.",
  "Gêmeos": "Comunicação em alta! Troque ideias e esteja aberto a novidades.",
  "Câncer": "Momento de olhar para dentro e fortalecer laços familiares.",
  "Leão": "Brilhe! Sua criatividade e carisma vão atrair boas conexões.",
  "Virgem": "Organize sua rotina e cuide da saúde. Pequenas mudanças trarão grandes resultados.",
  "Libra": "Equilibre emoções e relações. Semana favorável para parcerias.",
  "Escorpião": "Transformações positivas. Confie na sua intuição.",
  "Sagitário": "Expanda seus horizontes. Viagens e aprendizados favorecidos.",
  "Capricórnio": "Foco e disciplina trarão conquistas. Reconhecimento profissional em alta.",
  "Aquário": "Inove! Novas amizades e ideias podem surgir.",
  "Peixes": "Sensibilidade e inspiração. Bom momento para projetos criativos e autoconhecimento."
};

export default function PrevisaoSemanal() {
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  
  // Simulação: signo do usuário (deveria vir do perfil ou mapa astral)
  const signoUsuario = "Leão";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Header global com usuário e créditos */}
      <Header user={user} creditos={creditos} />
      
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header customizado da página */}
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

        {/* Seção de destaque da semana */}
        <div className="rounded-3xl bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 p-6 shadow-xl flex flex-col items-center text-white">
          <div className="flex items-center gap-2 mb-2">
            <GiPlanetConquest className="text-2xl" />
            <span className="text-lg font-semibold">Destaque da semana</span>
          </div>
          <div className="text-xl font-bold mb-1">Marte traz energia e movimento</div>
          <div className="text-base text-purple-100/90 text-center">A semana promete ação e coragem. Aproveite para tirar planos do papel, mas lembre-se de respeitar seus limites! ✨</div>
        </div>

        {/* Seção do carrossel dos dias da semana */}
        <div className="flex flex-col gap-2">
          <div className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2"><FaStar className="text-purple-400" /> Semana dia a dia</div>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {diasSemana.map((dia, idx) => (
              <div key={dia.dia} className="min-w-[140px] bg-white/90 rounded-2xl shadow-md p-4 flex flex-col items-center gap-2 border-t-4 border-purple-200">
                <div className="text-2xl">{dia.icone}</div>
                <div className="font-bold text-purple-700 text-base">{dia.dia}</div>
                <div className="text-xs text-purple-400 font-semibold mb-1">{dia.palavra}</div>
                <div className="text-xs text-gray-500 text-center">{dia.dica}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de previsão personalizada por signo */}
        <div className="rounded-2xl bg-white/90 shadow-lg p-6 flex flex-col items-center gap-2 border-l-4 border-purple-300">
          <div className="text-lg font-bold text-purple-700 mb-1">Para você, {signoUsuario.toLowerCase()}...</div>
          <div className="text-base text-gray-700 text-center mb-2">Hora de rever seus planos e se priorizar. {previsoesSimuladas[signoUsuario]}</div>
          <button className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition">Fazer meu Mapa Astral completo</button>
        </div>

        {/* Seção de áudio com a CatIA */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-200 to-blue-200 shadow-lg p-6 flex flex-col items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">
            <FaRegPlayCircle className="text-xl" /> Ouvir a previsão da semana com a voz da CatIA
          </button>
          {/* Player simulado */}
          <div className="w-full flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-purple-300 rounded-full overflow-hidden">
              <div className="h-2 bg-purple-500 rounded-full animate-pulse" style={{ width: '40%' }}></div>
            </div>
            <span className="text-xs text-purple-500">00:42</span>
          </div>
        </div>

        {/* Seção de integração com Diário */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/90 border border-purple-200 text-purple-700 font-bold shadow hover:bg-purple-100 transition">
            <FaRegEdit className="text-lg" /> Quero escrever sobre minha semana
          </button>
        </div>
      </div>
    </div>
  );
} 