import React from "react";
import { motion } from "framer-motion";

const planetIcons = {
  Sol: "🌞",
  Lua: "🌙",
  Mercúrio: "🪶",
  Vênus: "💖",
  Marte: "🔥",
  Júpiter: "⚡",
  Saturno: "🏛️",
  Urano: "🌀",
  Netuno: "🌊",
  Plutão: "🪐",
};

export default function ResultadoMapaAstral({
  dataNascimento,
  horaNascimento,
  cidadeNascimento,
  mapa = [],
  handleSalvarMapa,
}) {
  const temDados = Array.isArray(mapa) && mapa.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl shadow-2xl p-6 mt-8 mb-8"
    >
      <div className="flex flex-col gap-2 mb-6">
        <div className="text-center text-lg text-white/80 font-sans mb-1">
          <span className="font-bold text-2xl text-white">Seu Mapa Astral</span>
        </div>
        <div className="text-center text-sm text-purple-200 font-sans">
          {dataNascimento} às {horaNascimento} <br />
          {cidadeNascimento}
        </div>
      </div>
      <div className="overflow-x-auto">
        {temDados ? (
          <table className="w-full text-left rounded-xl bg-slate-900/80">
            <thead>
              <tr>
                <th className="py-2 px-2 text-slate-300 font-semibold text-base">Planeta</th>
                <th className="py-2 px-2 text-yellow-400 font-semibold text-base">Signo</th>
                <th className="py-2 px-2 text-slate-300 font-semibold text-base">Graus</th>
              </tr>
            </thead>
            <tbody>
              {mapa.map((item, idx) => (
                <motion.tr
                  key={item.planeta + idx}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.07 }}
                  className="border-b border-slate-700 last:border-none"
                >
                  <td className="py-2 px-2 font-bold text-white flex items-center gap-2">
                    <span className="text-xl">{planetIcons[item.planeta] || "🪐"}</span>
                    {item.planeta}
                  </td>
                  <td className="py-2 px-2 font-bold text-yellow-400">{item.signo}</td>
                  <td className="py-2 px-2 text-slate-200">{item.graus || '--'}°</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-purple-200 py-8">Nenhum dado de mapa astral disponível.</div>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.03 }}
        className="w-full mt-8 py-3 rounded-xl font-bold text-lg bg-pink-600 text-white shadow-lg hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handleSalvarMapa && handleSalvarMapa(mapa)}
        disabled={!temDados}
      >
        ✨ Salvar Mapa
      </motion.button>
    </motion.div>
  );
} 