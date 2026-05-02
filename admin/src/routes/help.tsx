import { useState } from "react";
import { Link } from "react-router";

interface PageDoc {
  path: string;
  title: string;
  section: string;
  description: string;
  features: string[];
  access: "todos" | "admin" | "owner" | "superadmin";
}

const PAGES: PageDoc[] = [
  // Visão Geral
  {
    path: "/",
    title: "Dashboard",
    section: "Visão Geral",
    description: "Painel inicial com métricas e KPIs da organização. Apresenta contadores de conteúdo publicado, candidatos, assets e atividades recentes em cards de estatística.",
    features: ["KPIs em tempo real", "Contadores por coleção", "Atalhos rápidos para seções"],
    access: "todos",
  },
  // Conteúdo
  {
    path: "/insights",
    title: "Insights",
    section: "Conteúdo",
    description: "Gestão de artigos e publicações do blog. Permite criar, editar e publicar conteúdo usando o editor de coleções genérico com suporte a campos customizáveis.",
    features: ["CRUD de artigos", "Campos customizáveis", "Preview de conteúdo", "Geração IA via Gabi"],
    access: "todos",
  },
  {
    path: "/publications",
    title: "Publicações & RI",
    section: "Conteúdo",
    description: "Gestão de documentos corporativos do tipo Relações com Investidores. Suporta upload de PDFs, categorizações por ano/tipo e visualização integrada.",
    features: ["Upload de PDFs (R2)", "Filtro por ano e tipo", "Viewer de PDF integrado", "Categorias: Resultados, Relatórios, Governança"],
    access: "todos",
  },
  {
    path: "/cases",
    title: "Cases",
    section: "Conteúdo",
    description: "Portfólio de projetos e cases de sucesso da empresa. Utiliza o mesmo sistema de coleções para gestão de conteúdo.",
    features: ["CRUD de cases", "Campos personalizados", "Imagem de destaque"],
    access: "todos",
  },
  {
    path: "/jobs",
    title: "Vagas",
    section: "Conteúdo",
    description: "Gestão de oportunidades de trabalho publicadas pela empresa. Integra-se com o módulo de candidatos (ATS) para triagem automatizada.",
    features: ["Publicação de vagas", "Campos de requisitos", "Status ativo/fechado"],
    access: "todos",
  },
  {
    path: "/applicants",
    title: "Candidatos (ATS)",
    section: "Conteúdo",
    description: "Sistema de Applicant Tracking (ATS) com triagem automatizada por IA. Analisa CVs recebidos com scoring e recomendações automáticas.",
    features: ["Lista de candidatos", "Análise de CV por IA", "Score de compatibilidade", "Aprovação/rejeição rápida"],
    access: "todos",
  },
  // Assets
  {
    path: "/social-calendar",
    title: "Calendário Social",
    section: "Assets",
    description: "Planejamento e agendamento de publicações em redes sociais. Organiza posts por data com status de rascunho, agendado e publicado.",
    features: ["Criação de posts", "Status: rascunho/agendado/publicado", "Visualização por lista"],
    access: "todos",
  },
  {
    path: "/media",
    title: "Assets & RAG Base",
    section: "Assets",
    description: "Repositório de arquivos (imagens, PDFs, documentos) armazenados no Cloudflare R2. Alimenta a base de conhecimento RAG da assistente Gabi.",
    features: ["Upload de arquivos (R2)", "Preview de imagens", "Vetoização automática (RAG)", "Busca por nome"],
    access: "todos",
  },
  // Marketing
  {
    path: "/brandbook",
    title: "Brandbook",
    section: "Marketing",
    description: "Central de identidade visual das marcas do grupo. Cores, tipografia, logos e guidelines de marca em formato visual.",
    features: ["Paleta de cores por marca", "Tipografia corporativa", "Assets vetoriais (SVG/EPS)", "Preview de logo em diferentes fundos"],
    access: "todos",
  },
  {
    path: "/signatures",
    title: "Assinaturas de E-mail",
    section: "Marketing",
    description: "Gerador de assinaturas HTML corporativas. Preencha os dados e exporte a assinatura formatada para Outlook, Gmail ou outro cliente.",
    features: ["Formulário de dados", "Preview em tempo real", "Copiar HTML", "Download de arquivo HTML", "Disclaimer LGPD automático"],
    access: "todos",
  },
  {
    path: "/decks",
    title: "Apresentações",
    section: "Marketing",
    description: "Gerador de apresentações corporativas em PDF. Selecione a marca, preencha slides e gere um deck profissional automaticamente.",
    features: ["Seleção de marca", "Editor de slides", "Geração de PDF", "Templates padronizados"],
    access: "todos",
  },
  // Gestão
  {
    path: "/newsletters",
    title: "Newsletters",
    section: "Gestão",
    description: "Criação e envio de campanhas de e-mail marketing. Gerencia lista de assinantes e histórico de envios.",
    features: ["Composição de campanhas", "Gestão de assinantes", "Preview de e-mail", "Histórico de envios", "Segmentação por audiência"],
    access: "todos",
  },
  {
    path: "/communications",
    title: "Central de Mensagens",
    section: "Gestão",
    description: "Inbox unificado para mensagens recebidas de formulários do site, leads capturados e interações de chat.",
    features: ["Filtro por tipo (form/chat/lead)", "Busca por conteúdo", "Detail panel lateral", "Marcar como lido"],
    access: "todos",
  },
  {
    path: "/ai-settings",
    title: "Gabi IA",
    section: "Gestão",
    description: "Configuração da assistente virtual Gabi. Controla persona, tom de voz, base de conhecimento e comportamento do chatbot integrado ao site.",
    features: ["Configuração de persona", "Tom de voz customizável", "Histórico de conversas", "Toggle ativo/inativo"],
    access: "todos",
  },
  {
    path: "/knowledge-base",
    title: "Memória da IA (RAG)",
    section: "Gestão",
    description: "Base de conhecimento vetorial que alimenta a assistente Gabi (RAG). Exibe documentos indexados e permite consultar o que a IA sabe.",
    features: ["Lista de documentos indexados", "Status de vetorização", "Estatísticas de chunks", "Teste de busca semântica"],
    access: "todos",
  },
  {
    path: "/emergency",
    title: "Fluxo de Emergência",
    section: "Gestão",
    description: "Protocolo de resposta para chamados críticos de clientes. Ativação de fluxo com script guiado e linha de comando de diagnóstico.",
    features: ["Formulário de ativação", "Script guiado de troubleshooting", "Log de comandos", "Histórico de incidentes"],
    access: "todos",
  },
  {
    path: "/automation",
    title: "Automações & IA",
    section: "Growth & IA",
    description: "Painel de automações inteligentes. Kanban de issues GitHub, automação de newsletters, triagem de CVs e social posts via IA.",
    features: ["Kanban GitHub", "Automação de newsletters", "Triagem automática de CVs", "Agendamento de posts"],
    access: "todos",
  },
  // Compliance
  {
    path: "/compliance",
    title: "Compliance & LGPD",
    section: "Compliance",
    description: "Central de conformidade com LGPD. Gerencia DSARs (requisições de titular), ROPA (registro de atividades de tratamento), canal de denúncias e incidentes de segurança.",
    features: ["DSAR Tracking", "ROPA (Registro de Tratamento)", "Canal de Denúncias", "Incidentes de Segurança", "Relatórios de auditoria"],
    access: "todos",
  },
  // Administração
  {
    path: "/saas",
    title: "Sua Empresa",
    section: "Administração",
    description: "Gestão do workspace da organização. Membros, permissões, configurações e plano de assinatura.",
    features: ["Gestão de membros", "Convites por e-mail", "Roles (owner/admin/member)", "Configurações do workspace"],
    access: "owner",
  },
  {
    path: "/account",
    title: "Minha Conta",
    section: "Administração",
    description: "Configurações pessoais do usuário. Perfil, senha, vinculação de provedores OAuth e preferências.",
    features: ["Edição de perfil", "Alterar senha", "Vincular Google/GitHub", "Ativar 2FA"],
    access: "todos",
  },
  // Super Admin
  {
    path: "/organizations",
    title: "Gestão Global de Empresas",
    section: "Super Admin",
    description: "Visão central de todos os workspaces cadastrados na plataforma. Exclusivo para administradores da Bekaa.",
    features: ["Lista de organizações", "Detalhes de cada workspace", "Contadores de membros"],
    access: "superadmin",
  },
  {
    path: "/users",
    title: "Gestão Global de Usuários",
    section: "Super Admin",
    description: "Administração centralizada de todos os usuários da plataforma. Exclusivo para administradores da Bekaa.",
    features: ["Lista de usuários", "Ban/unban", "Impersonate", "Detalhes de sessions"],
    access: "superadmin",
  },
];

const SECTIONS = [...new Set(PAGES.map(p => p.section))];

const ACCESS_LABELS: Record<string, { label: string; color: string }> = {
  todos: { label: "Todos", color: "text-emerald-500 bg-emerald-500/10" },
  admin: { label: "Admin", color: "text-blue-500 bg-blue-500/10" },
  owner: { label: "Owner", color: "text-amber-500 bg-amber-500/10" },
  superadmin: { label: "Super Admin", color: "text-red-500 bg-red-500/10" },
};

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filtered = PAGES.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.features.some(f => f.toLowerCase().includes(q));
    const matchSection = !activeSection || p.section === activeSection;
    return matchSearch && matchSection;
  });

  return (
    <div className="max-w-5xl w-full px-6 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Manual do Canal</h1>
        <p className="text-sm text-muted-foreground">Referência completa de todas as funcionalidades da plataforma.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar funcionalidade..."
            className="h-10 w-full pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!activeSection ? 'bg-brand-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Todos
          </button>
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(activeSection === s ? null : s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeSection === s ? 'bg-brand-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} de {PAGES.length} páginas</p>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(page => (
          <Link
            key={page.path}
            to={page.path}
            className="group bg-card border border-border rounded-xl p-5 space-y-3 hover:border-brand-primary/30 transition-colors cursor-pointer"
          >
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-primary transition-colors">{page.title}</h3>
                <span className="text-xs text-muted-foreground">{page.section}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ACCESS_LABELS[page.access].color}`}>
                {ACCESS_LABELS[page.access].label}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">{page.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5">
              {page.features.map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">{f}</span>
              ))}
            </div>

            {/* Path */}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <code className="text-xs font-mono text-muted-foreground">{page.path}</code>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground group-hover:text-brand-primary transition-colors"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 className="text-sm font-medium text-foreground">Nenhum resultado</h4>
          <p className="text-xs text-muted-foreground mt-1">Tente outra busca ou limpe os filtros.</p>
        </div>
      )}
    </div>
  );
}
