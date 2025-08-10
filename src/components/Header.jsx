import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCoins } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import avatarDefault from '../assets/avatar.png';
import { useNotificacoes } from '../hooks/useNotificacoes';
import NotificacoesModal from './NotificacoesModal';

export default function Header({ user, creditos, isWhiteText = false }) {
  const [openCreditos, setOpenCreditos] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const creditosRef = useRef(null);
  const navigate = useNavigate();
  
  // Hook de notificações
  const { 
    notificacoes, 
    novasNotificacoes, 
    marcarComoVista, 
    marcarTodasComoVistas,
    deletarNotificacao 
  } = useNotificacoes();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (creditosRef.current && !creditosRef.current.contains(event.target)) {
        setOpenCreditos(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    navigate('/');
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
            src={user?.photoURL || avatarDefault}
            alt="Avatar"
            className="w-12 h-12 rounded-full bg-white cursor-pointer border-2 border-white"
            onClick={handleAvatarClick}
            onError={(e) => {
              console.log("❌ Erro ao carregar foto de perfil:", user?.photoURL);
              e.target.src = avatarDefault;
            }}
            onLoad={() => {
              console.log("✅ Foto de perfil carregada:", user?.photoURL);
            }}
          />
        </div>
        <span className={`text-lg font-semibold ${isWhiteText ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
          Olá, {user?.displayName?.split(" ")[0] || "Visitante"}
        </span>
        {/* Popover Menu */}
      </div>
      {/* Notificações + Créditos */}
      <div className="flex items-center gap-2">
        {/* Botão de Notificações com Badge */}
        <button 
          className="p-2 relative"
          onClick={() => setShowNotificacoes(true)}
        >
          <FiBell className="w-6 h-6 text-gray-500 hover:text-gray-700 transition" />
          {novasNotificacoes > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {novasNotificacoes > 9 ? '9+' : novasNotificacoes}
            </div>
          )}
        </button>
        {/* Créditos Popover */}
        <div className="relative" ref={creditosRef}>
          <div
            className="flex items-center bg-gray-100 px-3 py-1 rounded-xl shadow text-gray-800 font-bold cursor-pointer select-none hover:bg-gray-200 transition"
            onClick={() => setOpenCreditos((prev) => !prev)}
          >
            <FaCoins className="text-amber-500 mr-1" />
            <span>{creditos}</span>
          </div>
          {openCreditos && (
            <div className="absolute right-0 mt-2 w-[220px] bg-gray-900 text-white rounded-xl shadow-lg z-50 p-4 flex flex-col items-center animate-fade-in">
              <h2 className="text-base font-bold mb-1 text-center">Seus Créditos</h2>
              <p className="text-gray-300 mb-4 text-sm text-center">Créditos disponíveis: <span className="font-bold text-white">{creditos}</span></p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mb-2 transition text-base"
                onClick={() => {
                  setOpenCreditos(false);
                  navigate('/comprar-creditos');
                }}
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
      
      {/* Modal de Notificações */}
      <NotificacoesModal
        isOpen={showNotificacoes}
        onClose={() => setShowNotificacoes(false)}
        notificacoes={notificacoes}
        onNotificacaoClick={marcarComoVista}
        onMarcarTodasVistas={() => {
          marcarTodasComoVistas();
          setShowNotificacoes(false);
        }}
        onDeletarNotificacao={deletarNotificacao}
      />
    </header>
  );
} 