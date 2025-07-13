// Página de login do app Universo Catia
// Permite autenticação via Google e redireciona para Home se já estiver logado

import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { auth, googleProvider } from "../firebaseConfigFront";

export default function Login() {
  const navigate = useNavigate();

  // Efeito para verificar se usuário já está logado e redirecionar
  useEffect(() => {
    // Se já está logado, redireciona para Home
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Função para realizar login com Google
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // O redirecionamento será feito pelo useEffect
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Container do formulário de login */}
      <div className="bg-white/80 p-8 rounded-2xl shadow-lg flex flex-col items-center">
        {/* Título da página */}
        <h1 className="text-2xl font-bold mb-6 text-purple-700 font-sans">Entrar no Tarô Místico</h1>
        
        {/* Botão de login com Google */}
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-purple-700 transition font-sans"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}