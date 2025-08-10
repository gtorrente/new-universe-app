// Fonte de conteúdo para capítulos Premium do Mapa Astral
// Estrutura:
// astrologyChapters[planetName] = {
//   title: string,
//   subtitle: string,
//   signs: {
//     [signName]: {
//       teaser: string,
//       paragraphs: string[]
//     }
//   }
// }

export const astrologyChapters = {
  Sol: {
    title: "Sua Essência",
    subtitle: "Identidade e Propósito",
    signs: {
      Libra: {
        teaser:
          "Essa combinação fala sobre a sua identidade, propósito e vitalidade — o ponto onde a ficha cai sobre quem você é.",
        paragraphs: [
          "Você brilha quando promove equilíbrio, beleza e conexão. O Sol em Libra te convida a ocupar o centro do palco nas relações — mas sem perder a elegância de ouvir, mediar e harmonizar. Sua presença traz senso de justiça, estética apurada e desejo de construir pontes.",
          "No capítulo completo, exploramos como suas escolhas ganham força quando alinhadas a parcerias saudáveis, como a busca por harmonia pode se tornar um superpoder (e também um desafio), e rituais práticos para nutrir sua identidade de forma autêntica e amorosa."
        ]
      }
      // Adicione outros signos conforme os textos ficarem prontos
    }
  },
  Lua: {
    title: "Mundo Emocional",
    subtitle: "Sentir e Pertencer",
    signs: {
      // Exemplo de estrutura:
      // "Touro": { teaser: "...", paragraphs: ["...", "..."] }
    }
  },
  Mercúrio: {
    title: "Mente e Comunicação",
    subtitle: "Pensar, Aprender e Dizer",
    signs: {}
  },
  Vênus: {
    title: "Afetos e Valores",
    subtitle: "Amor, Estética e Escolhas",
    signs: {}
  },
  Marte: {
    title: "Força de Ação",
    subtitle: "Desejo, Coragem e Conquista",
    signs: {}
  },
  Júpiter: {
    title: "Expansão e Sentido",
    subtitle: "Fé, Oportunidades e Crescimento",
    signs: {}
  },
  Saturno: {
    title: "Estrutura e Maturidade",
    subtitle: "Limites, Responsabilidade e Tempo",
    signs: {}
  },
  Urano: {
    title: "Autenticidade e Mudança",
    subtitle: "Liberdade, Ruptura e Inovação",
    signs: {}
  },
  Netuno: {
    title: "Inspiração e Intuição",
    subtitle: "Sonho, Sensibilidade e Mistério",
    signs: {}
  },
  Plutão: {
    title: "Transformação Profunda",
    subtitle: "Poder Pessoal, Ciclos e Cura",
    signs: {}
  }
};

export function getChapterContent(planetName, signName) {
  const planet = astrologyChapters[planetName];
  if (!planet) return null;
  const bySign = planet.signs?.[signName];
  return {
    title: planet.title,
    subtitle: planet.subtitle,
    teaser: bySign?.teaser || null,
    paragraphs: Array.isArray(bySign?.paragraphs) ? bySign.paragraphs : []
  };
}

