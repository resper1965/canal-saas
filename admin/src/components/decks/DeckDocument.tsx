import { Document, Page, Text, View, StyleSheet, Font, Svg, Circle } from "@react-pdf/renderer";

Font.register({
  family: "Montserrat",
  fonts: [
    { src: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr70w-.ttf", fontWeight: 700 },
  ],
});

const COLORS = {
  cyan: "#00ADE8",
  dark: "#0A0A0A",
  gray: "#888888",
  white: "#FFFFFF",
};

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

const s = StyleSheet.create({
  pageCover: { backgroundColor: COLORS.dark, padding: 60, justifyContent: "flex-end", height: "100%" },
  pageContent: { backgroundColor: COLORS.white, padding: 60 },
  coverBrand: { fontSize: 42, fontFamily: "Montserrat", fontWeight: 700, color: COLORS.white, letterSpacing: -1 },
  coverDot: { color: COLORS.cyan },
  coverTitle: { fontSize: 28, fontFamily: "Montserrat", fontWeight: 600, color: COLORS.white, marginTop: 24, lineHeight: 1.3 },
  coverSub: { fontSize: 14, fontFamily: "Montserrat", fontWeight: 400, color: COLORS.gray, marginTop: 12 },
  coverLine: { width: 60, height: 3, backgroundColor: COLORS.cyan, marginTop: 32, borderRadius: 2 },
  coverDate: { fontSize: 11, fontFamily: "Montserrat", color: COLORS.gray, marginTop: 16, textTransform: "uppercase" as "uppercase", letterSpacing: 2 },
  slideTitle: { fontSize: 24, fontFamily: "Montserrat", fontWeight: 700, color: COLORS.dark, marginBottom: 24 },
  slideLine: { width: 40, height: 3, backgroundColor: COLORS.cyan, marginBottom: 24, borderRadius: 2 },
  slideBody: { fontSize: 13, fontFamily: "Montserrat", fontWeight: 400, color: "#444", lineHeight: 1.8 },
  slideNumber: { position: "absolute" as "absolute", bottom: 30, right: 40, fontSize: 10, fontFamily: "Montserrat", color: COLORS.gray },
  footer: { position: "absolute" as "absolute", bottom: 30, left: 60, fontSize: 9, fontFamily: "Montserrat", color: "#CCC" },
  ctaPage: { backgroundColor: COLORS.dark, padding: 60, justifyContent: "center", alignItems: "center", height: "100%" },
  ctaTitle: { fontSize: 28, fontFamily: "Montserrat", fontWeight: 700, color: COLORS.white, textAlign: "center" as "center", marginBottom: 16 },
  ctaEmail: { fontSize: 16, fontFamily: "Montserrat", fontWeight: 400, color: COLORS.cyan, textAlign: "center" as "center" },
  ctaSub: { fontSize: 12, fontFamily: "Montserrat", fontWeight: 400, color: COLORS.gray, textAlign: "center" as "center", marginTop: 8 },
});

export type SlideContent = { title: string; body: string };

interface DeckDocumentProps {
  brand: string;
  title: string;
  slides: SlideContent[];
  date: string;
}

export function DeckDocument({ brand, title, slides, date }: DeckDocumentProps) {
  const b = BRANDS[brand] || BRANDS.ness;
  const brandParts = b.name.split(".");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.pageCover}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Text style={s.coverBrand}>
            {brandParts[0]}<Text style={s.coverDot}>.</Text>{brandParts[1] || ""}
          </Text>
          <Text style={s.coverTitle}>{title}</Text>
          <Text style={s.coverSub}>{b.tagline}</Text>
          <View style={s.coverLine} />
          <Text style={s.coverDate}>{date}</Text>
        </View>
      </Page>

      {slides.map((slide, i) => (
        <Page key={i} size="A4" orientation="landscape" style={s.pageContent}>
          <Text style={s.slideTitle}>{slide.title}</Text>
          <View style={s.slideLine} />
          <Text style={s.slideBody}>{slide.body}</Text>
          <Text style={s.slideNumber}>{String(i + 2).padStart(2, "0")}</Text>
          <Text style={s.footer}>{b.name} — Confidencial</Text>
        </Page>
      ))}

      <Page size="A4" orientation="landscape" style={s.ctaPage}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            <Circle cx={30} cy={30} r={6} fill={COLORS.cyan} />
          </Svg>
          <Text style={[s.ctaTitle, { marginTop: 24 }]}>Vamos conversar?</Text>
          <Text style={s.ctaEmail}>comercial@ness.com.br</Text>
          <Text style={s.ctaSub}>+55 11 3230-6757 · ness.com.br</Text>
        </View>
      </Page>
    </Document>
  );
}
