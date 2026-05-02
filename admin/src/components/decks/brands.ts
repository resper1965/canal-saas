/** Brand and template definitions — separated from DeckDocument to avoid pulling @react-pdf/renderer into the main bundle */

export const BRANDS: Record<string, { name: string; tagline: string }> = {
  "ness": { name: "ness.", tagline: "Tecnologia, Segurança e Inteligência desde 1991" },
  "trustness": { name: "trustness.", tagline: "Compliance, Privacidade & Governança" },
  "forense": { name: "forense.io", tagline: "Investigação Digital & Resposta a Incidentes" },
};

export const TEMPLATES: Record<string, { label: string; slides: string[] }> = {
  comercial: {
    label: "Proposta Comercial",
    slides: ["Capa", "Sobre a Empresa", "O Problema", "Nossa Solução", "Diferenciais", "Cases de Sucesso", "Investimento", "Próximos Passos"],
  },
  onepager: {
    label: "One-Pager de Serviço",
    slides: ["Capa", "Visão Geral", "Benefícios", "Como Funciona", "Contato"],
  },
  institucional: {
    label: "Deck Institucional",
    slides: ["Capa", "Quem Somos", "Timeline", "Verticais", "Números", "Equipe", "Contato"],
  },
  tecnico: {
    label: "Relatório Técnico",
    slides: ["Capa", "Sumário Executivo", "Metodologia", "Resultados", "Recomendações", "Anexos"],
  },
};
