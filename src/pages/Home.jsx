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

function useHoroscopo(signoEn) {
  const [horoscopo, setHoroscopo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signoEn) return;
    setLoading(true);
    fetch("https://81dbde66ca8f.ngrok-free.app/horoscopo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign: signoEn }),
    })
      .then(res => res.json())
      .then(data => {
        setHoroscopo(data.horoscopo || "Horóscopo indisponível.");
        setLoading(false);
      })
      .catch(() => {
        setHoroscopo("Não foi possível obter o horóscopo agora.");
        setLoading(false);
      });
  }, [signoEn]);

  return { horoscopo, loading };
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
          const signSalvo = userSnap.data().sign; // Campo signo salvo no Firebase
          
          if (dataNasc) {
            // Se já tem signo salvo, usa ele
            if (signSalvo) {
              setSignoEn(signSalvo);
              // Converte de inglês para português para exibição
              const signObj = getSignMapping().find(s => s.en === signSalvo);
              setSigno(signObj ? signObj.sign : "");
            } else {
              // Se não tem signo salvo, calcula e salva
              const [, mes, dia] = dataNasc.split('-').map(Number);
              const signObj = getSign(dia, mes);
              setSigno(signObj.sign);
              setSignoEn(signObj.en);
              
              // Salva o signo no Firebase
              await setDoc(userRef, { sign: signObj.en }, { merge: true });
            }
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
    
    // Calcular o signo baseado na data de nascimento
    const [, mes, dia] = dataNascimento.split('-').map(Number);
    const signObj = getSign(dia, mes);
    
    // Salvar tanto a data quanto o signo no Firebase
    await setDoc(userRef, { 
      dataNascimento,
      sign: signObj.en // Salva o signo em inglês
    }, { merge: true });
    
    // Atualizar o estado local
    setSigno(signObj.sign);
    setSignoEn(signObj.en);
    setShowModal(false);
  }

  const { horoscopo, loading: loadingHoroscopo } = useHoroscopo(signoEn);

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
          message={loadingHoroscopo ? "Carregando horóscopo..." : horoscopo}
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
