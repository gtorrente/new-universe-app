// Tabela de datas aproximadas de entrada do Sol em cada signo (formato DD/MM)
const datasSignos = [
  { signo: "Áries",      inicio: "21/03" },
  { signo: "Touro",      inicio: "20/04" },
  { signo: "Gêmeos",     inicio: "21/05" },
  { signo: "Câncer",     inicio: "21/06" },
  { signo: "Leão",       inicio: "23/07" },
  { signo: "Virgem",     inicio: "23/08" },
  { signo: "Libra",      inicio: "23/09" },
  { signo: "Escorpião",  inicio: "23/10" },
  { signo: "Sagitário",  inicio: "22/11" },
  { signo: "Capricórnio",inicio: "22/12" },
  { signo: "Aquário",    inicio: "20/01" },
  { signo: "Peixes",     inicio: "19/02" }
];

function getSignoSolar(dataNascimento) {
  // dataNascimento no formato YYYY-MM-DD ou DD/MM/AAAA
  let dia, mes;
  if (dataNascimento.includes("-")) {
    [, mes, dia] = dataNascimento.split("-").map(Number);
  } else {
    [dia, mes] = dataNascimento.split("/").map(Number);
  }
  const data = new Date(2000, mes - 1, dia);
  for (let i = datasSignos.length - 1; i >= 0; i--) {
    const [d, m] = datasSignos[i].inicio.split("/").map(Number);
    const dataSigno = new Date(2000, m - 1, d);
    if (data >= dataSigno) return datasSignos[i].signo;
  }
  return "Peixes";
}

// Tabela dos signos e seus intervalos em graus (para a Lua)
const signos = [
  { nome: 'Áries', inicio: 0 },
  { nome: 'Touro', inicio: 30 },
  { nome: 'Gêmeos', inicio: 60 },
  { nome: 'Câncer', inicio: 90 },
  { nome: 'Leão', inicio: 120 },
  { nome: 'Virgem', inicio: 150 },
  { nome: 'Libra', inicio: 180 },
  { nome: 'Escorpião', inicio: 210 },
  { nome: 'Sagitário', inicio: 240 },
  { nome: 'Capricórnio', inicio: 270 },
  { nome: 'Aquário', inicio: 300 },
  { nome: 'Peixes', inicio: 330 },
];

function grauParaSigno(grau) {
  const idx = Math.floor((grau % 360) / 30);
  return signos[idx]?.nome || 'Desconhecido';
}

import { julian, moonposition } from 'astronomia';

export async function calcularMapaAstral({ data, hora, coordenadas, timezoneOffset = -3 }) {
  // Sol: apenas data
  const signoSol = getSignoSolar(data);

  // Lua: data, hora local e fuso
  const [ano, mes, dia] = data.split('-').map(Number);
  const [h, m] = hora.split(':').map(Number);
  const dataLocal = new Date(Date.UTC(ano, mes - 1, dia, h, m));
  dataLocal.setUTCHours(dataLocal.getUTCHours() - timezoneOffset);
  const hUTC = dataLocal.getUTCHours();
  const mUTC = dataLocal.getUTCMinutes();
  const jdLua = julian.CalendarGregorianToJD(ano, mes, dia) + (hUTC + mUTC / 60) / 24;
  const luaEcl = moonposition.position(jdLua).lon;
  const luaSigno = grauParaSigno(luaEcl);

  // Os demais planetas ainda são simulados
  const planetas = [
    { planeta: 'Sol', signo: signoSol, graus: '--' },
    { planeta: 'Lua', signo: luaSigno, graus: luaEcl.toFixed(2) },
    { planeta: 'Mercúrio', signo: 'Libra', graus: '195.34' },
    { planeta: 'Vênus', signo: 'Escorpião', graus: '212.31' },
    { planeta: 'Marte', signo: 'Câncer', graus: '99.83' },
    { planeta: 'Júpiter', signo: 'Virgem', graus: '178.14' },
    { planeta: 'Saturno', signo: 'Aquário', graus: '314.84' },
    { planeta: 'Urano', signo: 'Capricórnio', graus: '285.31' },
    { planeta: 'Netuno', signo: 'Capricórnio', graus: '287.46' },
    { planeta: 'Plutão', signo: 'Escorpião', graus: '232.42' },
  ];

  return planetas;
} 