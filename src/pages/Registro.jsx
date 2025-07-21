import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfigFront";
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, CalendarIcon, UserIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import LogoUniversoCatia from "../assets/logo-purple-universo-catia.png";
import { Link } from "react-router-dom";

export default function Registro() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [termos, setTermos] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setErro("");
    if (!nome || !email || !senha || !confirmarSenha || !nascimento) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!termos) {
      setErro("Você precisa aceitar os Termos de Uso.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setErro("E-mail inválido.");
      return;
    }
    if (senha.length < 6) {
      setErro("Opa, sua senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(userCredential.user, { displayName: nome });
      // Aqui você pode salvar nascimento/termos no Firestore se quiser
      setErro("");
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está cadastrado.");
      } else {
        setErro("Erro ao criar conta: " + error.message);
      }
    } finally {
      setLoading(false);
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
      <form className="w-full max-w-sm pt-0 pb-8 px-4 flex flex-col gap-5" onSubmit={handleRegistro}>
        <h2 className="text-2xl font-light text-center text-purple-700 tracking-wide mb-2 mt-4">Crie sua conta</h2>
        <div>
          <label className="block text-gray-700 font-light mb-1">Nome completo</label>
          <div className="relative">
            <UserIcon className="w-5 h-5 text-gray-300 absolute left-3 top-3" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-gray-800 font-light placeholder-gray-400 transition-all"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              autoComplete="name"
            />
          </div>
        </div>
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
              placeholder="Crie uma senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="new-password"
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
        </div>
        <div>
          <label className="block text-gray-700 font-light mb-1">Confirmar senha</label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-gray-300 absolute left-3 top-3" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-gray-800 font-light placeholder-gray-400 transition-all"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-purple-400 transition"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-light mb-1">Data de nascimento</label>
          <div className="relative">
            <CalendarIcon className="w-5 h-5 text-gray-300 absolute left-3 top-3" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-gray-800 font-light placeholder-gray-400 transition-all"
              value={nascimento}
              onChange={e => setNascimento(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="termos"
            checked={termos}
            onChange={e => setTermos(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
          />
          <label htmlFor="termos" className="text-xs text-gray-600 select-none">
            Li e aceito os <a href="#" className="text-purple-500 hover:underline">Termos de Uso</a>
          </label>
        </div>
        {erro && <div className="text-red-500 text-sm text-center">{erro}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-lg tracking-wide shadow-lg hover:opacity-90 hover:scale-105 transition-all mt-2 focus:ring-2 focus:ring-purple-400"
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
        <div className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-purple-500 font-medium hover:underline">Entrar</Link>
        </div>
      </form>
    </div>
  );
} 