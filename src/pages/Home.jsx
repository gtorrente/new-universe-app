// Página principal do app Universo Catia
// Exibe saudação, horóscopo do dia, atalhos rápidos e acesso ao chat com a CatIA

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { auth } from "../firebaseConfigFront";
import { db } from "../firebaseConfigFront";
import { doc, getDoc, setDoc } from "firebase/firestore";
import HoroscopeCard from '../components/HoroscopeCard'
import QuickAccessCard from '../components/QuickAccessCard'
import { FaStar, FaEye, FaCalendarAlt } from 'react-icons/fa'
import { TbChefHat } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom'

function getSign(day, month) {
  const signs = [
    { sign: "Aquário", start: [1, 20] },
    { sign: "Peixes", start: [2, 19] },
    { sign: "Áries", start: [3, 21] },
    { sign: "Touro", start: [4, 20] },
    { sign: "Gêmeos", start: [5, 21] },
    { sign: "Câncer", start: [6, 21] },
    { sign: "Leão", start: [7, 23] },
    { sign: "Virgem", start: [8, 23] },
    { sign: "Libra", start: [9, 23] },
    { sign: "Escorpião", start: [10, 23] },
    { sign: "Sagitário", start: [11, 22] },
    { sign: "Capricórnio", start: [12, 22] },
  ];
  const date = new Date(2020, month - 1, day);
  for (let i = signs.length - 1; i >= 0; i--) {
    const [m, d] = signs[i].start;
    const startDate = new Date(2020, m - 1, d);
    if (date >= startDate) return signs[i].sign;
  }
  return "Capricórnio";
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

  // Efeito para buscar usuário autenticado e créditos no Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        // Cria/atualiza o documento do usuário com nome, email, foto
        await setDoc(userRef, {
          nome: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          foto: firebaseUser.photoURL || "",
        }, { merge: true });

        setUserDocId(firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCreditos(userSnap.data().creditos || 0);
          const dataNasc = userSnap.data().dataNascimento;
          if (dataNasc) {
            const [, mes, dia] = dataNasc.split('-').map(Number);
            setSigno(getSign(dia, mes));
          }
          if (!dataNasc) setShowModal(true);
        } else {
          setCreditos(0);
          setShowModal(true);
        }
      } else {
        setCreditos(0);
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleSalvarData() {
    if (!dataNascimento || !userDocId) return;
    const userRef = doc(db, "usuarios", userDocId);
    await setDoc(userRef, { dataNascimento }, { merge: true });
    // Atualizar o signo imediatamente
    const [, mes, dia] = dataNascimento.split('-').map(Number);
    setSigno(getSign(dia, mes));
    setShowModal(false);
  }

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
        <HoroscopeCard
          sign={signo || "Seu signo"}
          energy={4}
          message={
            signo
              ? `Hoje é um dia especial para quem é de ${signo}! As energias cósmicas estão alinhadas para você.`
              : "Preencha sua data de nascimento para ver seu horóscopo personalizado."
          }
        />
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
    </div>
  )
}
