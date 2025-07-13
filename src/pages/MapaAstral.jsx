// Página do Mapa Astral do app Universo Catia
// Permite calcular e visualizar o mapa astral baseado em data, hora e local de nascimento

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";
import { loadGoogleMaps } from "../utils/googleMapsLoader";
import ResultadoMapaAstral from "../components/ResultadoMapaAstral";
import { calcularMapaAstral } from "../utils/calcularMapaAstral";

// Componente de autocomplete de cidades usando o Place Autocomplete legado do Google Maps
function CidadeAutocomplete({ value, onChange, onSelect }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para inicializar o autocomplete do Google Maps
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
        if (onSelect) onSelect(null); // Limpa coordenadas se o usuário digitar manualmente
      }}
      placeholder={isLoading ? "Carregando..." : "Digite sua cidade..."}
      disabled={isLoading}
      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
      required
      autoComplete="off"
    />
  );
}

// Página principal do Mapa Astral
export default function MapaAstral() {
  // Estado do usuário autenticado e créditos
  const [user, setUser] = useState(null);
  const [creditos, setCreditos] = useState(0);

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

  // Estados do formulário de dados de nascimento
  const [dataNascimento, setDataNascimento] = useState("");
  const [horaNascimento, setHoraNascimento] = useState("");
  const [cidade, setCidade] = useState("");
  const [coordenadas, setCoordenadas] = useState(null);

  // Controle de tela: 'form', 'loading', 'resultado'
  const [tela, setTela] = useState("form");
  const [dadosMapa, setDadosMapa] = useState(null);
  const [resultadoMapa, setResultadoMapa] = useState(null);

  // Função para gerar o mapa astral
  async function handleGerarMapaAstral(e) {
    e.preventDefault();
    setDadosMapa({
      dataNascimento,
      horaNascimento,
      cidadeNascimento: cidade,
      coordenadas: coordenadas || { lat: 0, lng: 0 },
    });
    setTela("loading");
    try {
      const resultado = await calcularMapaAstral({
        data: dataNascimento,
        hora: horaNascimento,
        coordenadas: coordenadas || { lat: 0, lng: 0 },
      });
      setResultadoMapa(resultado);
      setTimeout(() => {
        setTela("resultado");
      }, 800);
    } catch (err) {
      alert("Erro ao calcular mapa astral. Tente novamente.");
      setTela("form");
    }
  }

  // Validação dos campos obrigatórios
  const camposObrigatoriosPreenchidos = dataNascimento && horaNascimento && cidade;

  // Função para voltar ao formulário
  function handleVoltar() {
    setTela("form");
    setResultadoMapa(null);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header global com usuário e créditos */}
      <Header user={user} creditos={creditos} />
      
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center">
        {/* Tela do formulário */}
        {tela === "form" && (
          <form onSubmit={handleGerarMapaAstral} className="bg-white/80 rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6 animate-fade-in">
            {/* Título e instruções */}
            <div className="flex flex-col items-center mb-2">
              <span className="text-3xl mb-2">💫</span>
              <h2 className="text-2xl font-bold text-purple-700 font-neue-bold mb-1">Queremos te conhecer melhor</h2>
              <p className="text-gray-600 text-center font-neue text-base">Para revelar sua verdadeira essência, precisamos saber sua data de nascimento e horário aproximado.</p>
            </div>
            
            {/* Campo: Data de nascimento */}
            <div>
              <label className="block text-purple-700 font-semibold mb-1 font-neue-bold" htmlFor="data-nascimento">Data de nascimento <span className="text-red-500">*</span></label>
              <input
                id="data-nascimento"
                type="date"
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800"
                required
              />
            </div>
            
            {/* Campo: Hora de nascimento */}
            <div>
              <label className="block text-purple-700 font-semibold mb-1 font-neue-bold" htmlFor="hora-nascimento">Horário de nascimento <span className="text-red-500">*</span></label>
              <input
                id="hora-nascimento"
                type="time"
                value={horaNascimento}
                onChange={e => setHoraNascimento(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-sans text-gray-800"
                placeholder="Ex: 14:30"
                required
              />
            </div>
            
            {/* Campo: Cidade de nascimento com autocomplete Google */}
            <div className="relative">
              <label className="block text-purple-700 font-semibold mb-1 font-neue-bold" htmlFor="cidade-nascimento">Cidade de nascimento <span className="text-red-500">*</span></label>
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
            
            {/* Botão CTA para gerar mapa astral */}
            <button
              type="submit"
              disabled={!camposObrigatoriosPreenchidos}
              className={`w-full py-3 rounded-xl font-bold text-lg transition shadow ${camposObrigatoriosPreenchidos ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-200 text-purple-400 cursor-not-allowed'}`}
            >
              Gerar meu Mapa Astral
            </button>
          </form>
        )}
        
        {/* Tela de loading durante o cálculo */}
        {tela === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-6"></div>
            <div className="text-lg text-purple-700 font-bold mb-2">Calculando seu mapa astral...</div>
            <div className="text-sm text-purple-400">Aguarde um instante ✨</div>
          </div>
        )}
        
        {/* Tela de resultado do mapa astral */}
        {tela === "resultado" && dadosMapa && resultadoMapa && (
          <div className="w-full flex flex-col items-center">
            <ResultadoMapaAstral
              dataNascimento={dadosMapa.dataNascimento}
              horaNascimento={dadosMapa.horaNascimento}
              cidadeNascimento={dadosMapa.cidadeNascimento}
              coordenadas={dadosMapa.coordenadas}
              mapa={resultadoMapa}
              handleSalvarMapa={() => {}}
            />
            {/* Botão para voltar ao formulário */}
            <button
              onClick={handleVoltar}
              className="mt-4 text-purple-600 hover:underline text-sm font-semibold"
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}