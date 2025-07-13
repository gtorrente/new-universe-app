// Página principal do app Universo Catia
// Exibe saudação, horóscopo do dia, atalhos rápidos e acesso ao chat com a CatIA

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { auth } from "../firebaseConfigFront";
import { db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import HoroscopeCard from '../components/HoroscopeCard'
import QuickAccessCard from '../components/QuickAccessCard'
import { FaStar, FaEye, FaCalendarAlt } from 'react-icons/fa'
import { TbChefHat } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom'

export default function Home() {
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const navigate = useNavigate();

  // Efeito para buscar usuário autenticado e créditos no Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Busca créditos do Firestore
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
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen">
      {/* Header global com avatar, saudação e créditos */}
      <Header user={user} creditos={creditos} />

      {/* Saudação e pergunta do dia */}
      <div className="px-4 mt-4 mb-2">
        <p className="text-sm text-gray-500 font-neue">Como você está se sentindo hoje?</p>
      </div>

      {/* Card do horóscopo do dia */}
      <div className="px-4">
        <HoroscopeCard
          sign="Libra"
          energy={4}
          message="Hoje é um dia especial para focar no autoconhecimento. As energias cósmicas estão alinhadas para trazer clareza sobre seus objetivos pessoais. Pratique a gratidão e mantenha-se aberta para novas oportunidades."
        />
      </div>

      {/* Grid de cards de acesso rápido para funcionalidades principais */}
      <div className="grid grid-cols-2 gap-4 mt-6 px-4">
        <QuickAccessCard title="Mapa Astral" subtitle="Descubra sua personalidade" icon={<FaStar />} onClick={() => navigate('/mapa-astral')} />
        <QuickAccessCard title="Tarot do Dia" subtitle="Orientação para hoje" icon={<FaEye />} onClick={() => navigate('/tarot')} />
        <QuickAccessCard title="Receitas da Catia" subtitle="Simples e deliciosas" icon={<TbChefHat />}onClick={() => navigate('/receitas')} />
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
    </div>
  )
}
