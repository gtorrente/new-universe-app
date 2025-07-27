// MOCK TEMPORÁRIO DE HORÓSCOPO - Usar enquanto api.torrente.com.br está fora do ar
// ⚠️ REMOVER ESTE ARQUIVO quando a API voltar a funcionar

const signos = {
  aries: 'Áries',
  taurus: 'Touro', 
  gemini: 'Gêmeos',
  cancer: 'Câncer',
  leo: 'Leão',
  virgo: 'Virgem',
  libra: 'Libra',
  scorpio: 'Escorpião',
  sagittarius: 'Sagitário',
  capricorn: 'Capricórnio',
  aquarius: 'Aquário',
  pisces: 'Peixes'
};

const focosEEnergias = [
  { foco: 'Trabalho', energia: 'Alta' },
  { foco: 'Amor', energia: 'Média' },
  { foco: 'Saúde', energia: 'Alta' },
  { foco: 'Dinheiro', energia: 'Baixa' },
  { foco: 'Família', energia: 'Alta' },
  { foco: 'Descanso', energia: 'Média' },
  { foco: 'Reflexão', energia: 'Alta' },
  { foco: 'Criatividade', energia: 'Média' },
  { foco: 'Espiritualidade', energia: 'Alta' },
  { foco: 'Aventura', energia: 'Alta' },
  { foco: 'Estudos', energia: 'Média' },
  { foco: 'Relacionamentos', energia: 'Alta' }
];

const horoscoposFrases = [
  'está em um momento especial de transformação e crescimento pessoal.',
  'pode esperar surpresas positivas relacionadas ao amor e carreira.',
  'está prestes a iniciar um novo ciclo repleto de oportunidades.',
  'encontrará o equilíbrio perfeito entre razão e emoção hoje.',
  'sua intuição estará mais aguçada, confie em seus instintos.',
  'é um excelente momento para cuidar da saúde e bem-estar.',
  'as energias cósmicas favorecem novos relacionamentos e parcerias.',
  'sua criatividade estará em alta, explore seus talentos.',
  'momento propício para organizar as finanças e planejar o futuro.',
  'a comunicação será sua maior aliada nas próximas horas.',
  'os astros indicam mudanças positivas no âmbito profissional.',
  'hora de colocar em prática aqueles projetos que estavam guardados.',
  'sua sensibilidade estará aflorada, use isso a seu favor.',
  'momento ideal para fortalecer laços familiares e de amizade.',
  'as estrelas trazem boas notícias para sua vida amorosa.',
  'sua determinação será fundamental para alcançar seus objetivos.',
  'tempo de colher os frutos do que foi plantado com dedicação.',
  'novos horizontes se abrem, esteja preparado para as mudanças.',
  'sua energia estará contagiante, inspire outros ao seu redor.',
  'momento de reflexão que trará insights importantes para sua jornada.'
];

const complementosHoroscopo = [
  'Os planetas estão alinhados de forma favorável.',
  'Mercúrio em trânsito traz clareza mental.',
  'A Lua crescente potencializa suas emoções.',
  'Júpiter expande suas possibilidades hoje.',
  'Vênus harmoniza seus relacionamentos.',
  'Marte energiza seus projetos pessoais.',
  'O Sol ilumina seu caminho profissional.',
  'Saturno traz estabilidade às suas decisões.',
  'Urano desperta sua criatividade.',
  'Netuno aguça sua intuição.',
  'Plutão transforma antigas estruturas.',
  'A energia cósmica está a seu favor.'
];

function gerarHoroscopoDiario(signo) {
  const nomeSigno = signos[signo] || 'seu signo';
  const frase = horoscoposFrases[Math.floor(Math.random() * horoscoposFrases.length)];
  const complemento = complementosHoroscopo[Math.floor(Math.random() * complementosHoroscopo.length)];
  
  const horoscopoCompleto = `Hoje ${nomeSigno} ${frase} ${complemento} Mantenha-se aberto às oportunidades que surgirão e confie em sua intuição para tomar as melhores decisões.`;
  
  return {
    horoscopo: horoscopoCompleto
  };
}

function gerarPrevisaoSemanal(signo) {
  const nomeSigno = signos[signo] || 'seu signo';
  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  
  const semana = {};
  diasSemana.forEach(dia => {
    const focoEnergia = focosEEnergias[Math.floor(Math.random() * focosEEnergias.length)];
    semana[dia] = focoEnergia;
  });

  const titulosSemana = [
    'Semana de Renovação',
    'Semana de Oportunidades', 
    'Semana de Transformação',
    'Semana de Crescimento',
    'Semana de Descobertas',
    'Semana de Harmonia',
    'Semana de Conquistas',
    'Semana de Reflexão'
  ];

  const titulo = `${titulosSemana[Math.floor(Math.random() * titulosSemana.length)]} para ${nomeSigno}`;
  
  return {
    destaque: {
      titulo: titulo,
      descricao: `Uma semana repleta de possibilidades se abre para ${nomeSigno}. As energias cósmicas favorecem o crescimento pessoal e novas descobertas sobre si mesmo. É momento de confiar em sua intuição e abraçar as mudanças que estão por vir.`,
      mensagem_audio_catia: `Olá, querido ${nomeSigno}! Esta semana será especial para você, com muitas oportunidades de crescimento e renovação. Os astros estão alinhados de forma favorável para suas realizações pessoais.`
    },
    semana
  };
}

export const horoscopoMock = {
  gerarHoroscopoDiario,
  gerarPrevisaoSemanal,
  isActive: () => {
    // Mock sempre ativo enquanto API estiver fora do ar
    console.log('⚠️ USANDO MOCK TEMPORÁRIO - API fora do ar');
    return true;
  }
};

export default horoscopoMock; 