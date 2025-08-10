import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { getChapterContent } from '../data/astrologyChapters';
import { auth, db } from '../firebaseConfigFront';
import { doc, getDoc } from 'firebase/firestore';

export default function CapituloAstrologico() {
  const { planeta, signo } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCreditos(userData.creditos || 0);
        } else {
          setCreditos(0);
        }
      } else {
        setCreditos(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const chapter = useMemo(() => getChapterContent(planeta, signo), [planeta, signo]);

  const title = chapter?.title || planeta;
  const subtitle = chapter?.subtitle || 'Capítulo';
  const paragraphs = chapter?.paragraphs?.length ? chapter.paragraphs : [
    'Conteúdo completo em breve. Estamos preparando uma análise aprofundada, com linguagem clara e exemplos práticos.',
    'Obrigado por apoiar o Premium! Em poucos dias, este capítulo estará disponível para você com todo carinho.'
  ];

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'radial-gradient(1600px 900px at 20% -10%, rgba(111,66,193,0.15), transparent), radial-gradient(1400px 800px at 120% 110%, rgba(0,119,255,0.12), transparent), linear-gradient(135deg, #140c2e 0%, #1d0f3f 55%, #090d1a 100%)',
      }}
    >
      <Header user={user} creditos={creditos} isWhiteText={true} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/mapa-astral?step=3')}
          className="mb-6 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15"
        >
          ← Voltar para interpretação
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-gray-900 rounded-2xl p-6 md:p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-extrabold font-neue-bold">{title}</h1>
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{signo}</span>
          </div>
          <p className="text-gray-600 mb-6">{subtitle}</p>

          <div className="space-y-4 leading-relaxed text-lg">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

