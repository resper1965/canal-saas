import type { ReactNode } from "react";
import type { statement } from '@shared/permissions';

type PermissionCheck = Partial<{
  [K in keyof typeof statement]: (typeof statement)[K][number][]
}>

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  /** RBAC: required permission to see this item */
  requiredPermission?: PermissionCheck;
}

export interface NavGroup {
  section: string;
  icon?: ReactNode;
  items: NavItem[];
  adminOnly?: boolean;
  ownerOnly?: boolean;
  /** RBAC: required permission to see this group */
  requiredPermission?: PermissionCheck;
}

export const ADMIN_NAV: NavGroup[] = [
  {
    section: "Sistema Total",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26a8 8 0 1 0-9.48 0H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM12 10v4M10 14h4"/></svg>,
    adminOnly: true,
    items: [

      {
        to: "/organizations",
        label: "Gestão Global de Empresas",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        ),
      },
      {
        to: "/users",
        label: "Usuários da Plataforma",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
    ],
  },
];

export const NAV: NavGroup[] = [
  {
    section: "Visão Geral",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    items: [
      {
        to: "/",
        end: true,
        label: "Dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        ),
      },
      {
        to: "/activity",
        label: "Atividades",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Conteúdo",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5z"/></svg>,
    items: [
      {
        to: "/insights",
        label: "Insights",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        ),
      },
      {
        to: "/publications",
        label: "Publicações & RI",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        ),
      },
      {
        to: "/cases",
        label: "Cases",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
        ),
      },
      {
        to: "/jobs",
        label: "Vagas",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        ),
      },
      {
        to: "/applicants",
        label: "Candidatos (ATS)",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M8 11.52L10.84 14 16 9"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Assets",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    items: [
      {
        to: "/social-calendar",
        label: "Calendário Social",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        ),
      },
      {
        to: "/media",
        label: "Assets & RAG Base",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Marketing",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    items: [
      {
        to: "/brand",
        label: "Brand Hub",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/>
            <circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Gestão",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    items: [
      {
        to: "/pipeline",
        label: "Pipeline de Leads",
        requiredPermission: { lead: ['read'] },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
        ),
      },
      {
        to: "/outbox",
        label: "Central de Mensagens",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/>
          </svg>
        ),
      },
      {
        to: "/intelligence",
        label: "Inteligência Artificial",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M6 10v1a6 6 0 0 0 12 0v-1"/><path d="M12 18v4"/><path d="M8 22h8"/>
          </svg>
        ),
      },
      {
        to: "/emergency",
        label: "Fluxo de Emergência",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Compliance",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
    requiredPermission: { compliance: ['read'] },
    items: [
      {
        to: "/compliance",
        label: "LGPD & Denúncias",
        requiredPermission: { compliance: ['read'] },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Administração",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    ownerOnly: true,
    requiredPermission: { settings: ['update'] },
    items: [
      {
        to: "/saas",
        label: "Sua Empresa",
        requiredPermission: { settings: ['read'] },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: "Ajuda",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>,
    items: [
      {
        to: "/help",
        label: "Manual",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </svg>
        ),
      },
    ],
  },
];

export const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/":        { title: "Dashboard",       sub: "Visão geral da plataforma" },
  "/insights": { title: "Insights",       sub: "Artigos e publicações do blog" },
  "/cases":   { title: "Cases",          sub: "Portfólio de projetos e cases" },
  "/jobs":    { title: "Vagas",          sub: "Oportunidades publicadas" },
  "/applicants": { title: "Candidatos", sub: "Gestão de candidatos e triagem" },
  "/social-calendar": { title: "Calendário Social", sub: "Posts agendados e publicados" },
  "/media":       { title: "Assets & RAG",   sub: "Repositório Pessoal e Base de IA" },
  "/brand":       { title: "Brand Hub",      sub: "Brandbook, Assinaturas e Apresentações" },
  "/brandbook":   { title: "Brand Hub",      sub: "Brandbook, Assinaturas e Apresentações" },
  "/signatures":  { title: "Brand Hub",      sub: "Brandbook, Assinaturas e Apresentações" },
  "/decks":       { title: "Brand Hub",      sub: "Brandbook, Assinaturas e Apresentações" },
  "/outbox":      { title: "Central de Mensagens", sub: "Inbox, Forms, Leads e Newsletters" },
  "/communications": { title: "Central de Mensagens", sub: "Inbox, Forms, Leads e Newsletters" },
  "/newsletters": { title: "Central de Mensagens", sub: "Inbox, Forms, Leads e Newsletters" },
  "/intelligence": { title: "Inteligência Artificial", sub: "Configuração, RAG e Automações" },
  "/knowledge-base": { title: "Inteligência Artificial", sub: "Configuração, RAG e Automações" },
  "/ai-settings": { title: "Inteligência Artificial", sub: "Configuração, RAG e Automações" },
  "/automation":  { title: "Inteligência Artificial", sub: "Configuração, RAG e Automações" },
  "/account": { title: "Minha Conta",   sub: "Perfil, senha e vinculações" },
  "/saas":    { title: "Sua Empresa",     sub: "Gestão do workspace e membros" },
  "/users":   { title: "Gestão Global de Usuários", sub: "Administração de acessos (Super Admin)" },
  "/organizations": { title: "Gestão Global de Empresas", sub: "Visão central de workspaces (Super Admin)" },
  "/compliance":  { title: "Compliance & LGPD", sub: "DSAR, Canal de Denúncia e Políticas" },
  "/activity":    { title: "Timeline de Atividades", sub: "Tudo que acontece na sua organização" },
  "/pipeline":    { title: "Pipeline de Leads", sub: "Visualize, pontue e gerencie seus leads" },
  "/publications": { title: "Publicações & RI", sub: "Resultados financeiros, relatórios e documentos" },
  "/emergency":   { title: "Fluxo de Emergência", sub: "Tratativa de Chamados Críticos do Cliente" },
  "/help":        { title: "Manual",             sub: "Referência completa da plataforma" },
};

// Platform administrators: all @bekaa.eu email addresses + explicit list
export const SUPER_ADMIN_DOMAIN = 'bekaa.eu';
export const SUPER_ADMIN_EMAILS = ['admin@ness.com.br', 'resper@ness.com.br', 'resper@bekaa.eu'];

/** Check if user is a platform super admin (can navigate all orgs) */
export function isSuperAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  if (email.endsWith(`@${SUPER_ADMIN_DOMAIN}`)) return true;
  return SUPER_ADMIN_EMAILS.includes(email);
}
