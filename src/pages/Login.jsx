// Página de login do app Universo Catia
// Permite autenticação via Google e redireciona para Home se já estiver logado

import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "../firebaseConfigFront";
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import LogoUniversoCatia from "../assets/logo-purple-universo-catia.png"; // ajuste o caminho se necessário

export default function Login() {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);  

  // Efeito para verificar se usuário já está logado e redirecionar
  useEffect(() => {
    // Se já está logado, redireciona para Home
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Função para realizar login com Google
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    // Simulação de login com e-mail/senha (substitua pela lógica real se quiser)
    setTimeout(() => {
      if (!email || !senha) {
        setErro("Preencha todos os campos.");
      } else if (!email.includes("@")) {
        setErro("E-mail inválido.");
      } else if (senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setErro("");
        alert("Login realizado!");
      }
      setLoading(false);
    }, 800);
  };

  const handleGoogleLogin = async () => {
    setErro("");
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirecionamento automático pelo useEffect
    } catch (error) {
      setErro("Erro ao fazer login: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#e9d8fd] via-[#f5f0ff] to-[#d3b9ff] px-4">
      <motion.img
        src={LogoUniversoCatia}
        alt="Logo Universo Catia"
        className="mx-auto mb-0 max-w-[216px] select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm pt-0 pb-8 px-4 flex flex-col gap-5"
      >
          <div>
            <label className="block text-gray-700 font-light mb-1">E-mail</label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 text-gray-300 absolute left-3 top-3" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-gray-800 font-light placeholder-gray-400 transition-all"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-light mb-1">Senha</label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-gray-300 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-gray-800 font-light placeholder-gray-400 transition-all"
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-purple-400 transition"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="text-right mt-1">
              <a href="#" className="text-xs text-gray-400 hover:text-purple-500 transition">Esqueci a senha</a>
            </div>
          </div>
          {erro && <div className="text-red-500 text-sm text-center">{erro}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold text-lg tracking-wide shadow-lg hover:opacity-90 hover:scale-105 transition-all mt-2 focus:ring-2 focus:ring-purple-400"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="mx-3 text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border-2 border-purple-500 text-purple-700 font-semibold text-lg tracking-wide shadow-lg hover:bg-purple-50 hover:scale-105 transition-all"
            whileTap={{ scale: 0.97 }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            Entrar com Google
          </motion.button>
          {/* Link para criar conta */}
          <div className="text-center text-xs text-gray-600 mt-6">
            Ainda não tem uma conta?{' '}
            <a href="#" className="text-purple-500 font-medium hover:underline">Crie agora</a>
          </div>
          <div className="text-center text-xs text-gray-600 mt-2">
            Ao entrar, você concorda com nossos <a href="#" className="text-purple-500 font-medium hover:underline">Termos de Uso</a>
          </div>
      </form>
    </div>
  );
}