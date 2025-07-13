import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfigFront";
import { useNavigate } from "react-router-dom";
import { FaFire } from "react-icons/fa";
import { FiBell } from "react-icons/fi";

export default function Header({ user, creditos }) {
  const [open, setOpen] = useState(false);
  const [openCreditos, setOpenCreditos] = useState(false);
  const menuRef = useRef(null);
  const creditosRef = useRef(null);
  const navigate = useNavigate();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (creditosRef.current && !creditosRef.current.contains(event.target)) {
        setOpenCreditos(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    setOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between p-4 relative bg-transparent">
      {/* Avatar + Saudação */}
      <div className="flex items-center gap-3 relative">
        <div
          className="p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-purple-700"
          style={{ display: 'inline-block' }}
        >
          <img
            src={user?.photoURL || "/default.png"}
            alt="Avatar"
            className="w-12 h-12 rounded-full bg-white cursor-pointer border-2 border-white"
            onClick={handleAvatarClick}
          />
        </div>
        <span className="text-lg font-semibold text-gray-800">
          Olá, {user?.displayName?.split(" ")[0] || "Visitante"}
        </span>
        {/* Popover Menu */}
        {open && (
          <div
            ref={menuRef}
            className="absolute left-0 top-full mt-2 w-44 bg-gray-900 text-white rounded-xl shadow-lg z-50 p-3 flex flex-col gap-2"
          >
            <button className="text-left rounded-lg px-2 py-2 transition hover:bg-gray-800/60" onClick={() => { navigate('/perfil'); setOpen(false); }}>Perfil</button>
            <button className="text-left rounded-lg px-2 py-2 transition hover:bg-gray-800/60" onClick={() => { navigate('/indique'); setOpen(false); }}>Indique um Amigo</button>
            <button className="text-left rounded-lg px-2 py-2 transition hover:bg-gray-800/60" onClick={() => { navigate('/contato'); setOpen(false); }}>Fale Conosco</button>
            <hr className="my-2 border-gray-700" />
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        )}
      </div>
      {/* Notificações + Créditos */}
      <div className="flex items-center gap-2">
        <button className="p-2">
          <FiBell className="w-6 h-6 text-gray-500" />
        </button>
        {/* Créditos Popover */}
        <div className="relative" ref={creditosRef}>
          <div
            className="flex items-center bg-gray-100 px-3 py-1 rounded-xl shadow text-gray-800 font-bold cursor-pointer select-none hover:bg-gray-200 transition"
            onClick={() => setOpenCreditos((prev) => !prev)}
          >
            <FaFire className="text-yellow-400 mr-1" />
            <span>{creditos}</span>
          </div>
          {openCreditos && (
            <div className="absolute right-0 mt-2 w-[220px] bg-gray-900 text-white rounded-xl shadow-lg z-50 p-4 flex flex-col items-center animate-fade-in">
              <h2 className="text-base font-bold mb-1 text-center">Seus Créditos</h2>
              <p className="text-gray-300 mb-4 text-sm text-center">Créditos disponíveis: <span className="font-bold text-white">{creditos}</span></p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mb-2 transition text-base"
                onClick={() => alert('Redirecione para tela de pagamento!')}
              >
                Adicione Créditos
              </button>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition text-base"
                onClick={() => setOpenCreditos(false)}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 