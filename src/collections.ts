/**
 * Canal CMS — Collection Definitions (code-first, Payload-inspired)
 *
 * Cada collection define o tipo de conteúdo, seus campos e comportamentos.
 * Essas definições alimentam a API CRUD genérica e o admin panel.
 */

export type GovernancePolicy = 'autonomous' | 'assisted' | 'protected'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'slug'
  | 'select'
  | 'date'
  | 'number'
  | 'boolean'
  | 'json'
  | 'image'
  | 'relation'

export interface FieldDef {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  defaultValue?: unknown
  options?: string[]       // para type: 'select'
  from?: string            // para type: 'slug' — campo de origem
  relation?: string        // para type: 'relation' — slug da collection alvo
}

export interface CollectionDef {
  slug: string
  label: string
  labelPlural?: string
  icon: string
  hasLocale: boolean       // se entries têm campo locale
  hasSlug: boolean         // se entries têm campo slug
  hasStatus: boolean       // se entries têm draft/published
  governance: GovernancePolicy  // autonomous | assisted | protected
  fields: FieldDef[]
}

// ── Definições das Collections ──────────────────────────────────

export const collections: CollectionDef[] = [
  {
    slug: 'insights',
    label: 'Insight',
    labelPlural: 'Insights',
    icon: 'FileText',
    hasLocale: true,
    hasSlug: true,
    hasStatus: true,
    governance: 'autonomous',
    fields: [
      { name: 'published', type: 'boolean', label: 'Publicado', defaultValue: false },
      { name: 'title', type: 'text', required: true, label: 'Título' },
      { name: 'tag', type: 'select', label: 'Tag', options: [
        'Segurança', 'IA', 'Cloud', 'Infraestrutura', 'Dados',
        'Compliance', 'DevOps', 'Telecom', 'Tendências', 'Informação Corporativa'
      ]},
      { name: 'icon', type: 'text', label: 'Ícone', defaultValue: 'FileText' },
      { name: 'date', type: 'date', required: true, label: 'Data' },
      { name: 'desc', type: 'textarea', label: 'Descrição' },
      { name: 'body', type: 'richtext', label: 'Conteúdo' },
      { name: 'cover', type: 'image', label: 'Imagem de Capa' },
      { name: 'featured', type: 'boolean', label: 'Destaque', defaultValue: false },
    ]
  },
  {
    slug: 'cases',
    label: 'Case',
    labelPlural: 'Cases',
    icon: 'Briefcase',
    hasLocale: true,
    hasSlug: true,
    hasStatus: true,
    governance: 'autonomous',
    fields: [
      { name: 'published', type: 'boolean', label: 'Publicado', defaultValue: false },
      { name: 'client', type: 'text', required: true, label: 'Cliente' },
      { name: 'category', type: 'select', label: 'Categoria', options: [
        'infraestrutura', 'segurança', 'cloud', 'telecomunicações',
        'dados', 'compliance', 'ia'
      ]},
      { name: 'project', type: 'text', required: true, label: 'Projeto' },
      { name: 'result', type: 'text', label: 'Resultado' },
      { name: 'desc', type: 'textarea', label: 'Descrição' },
      { name: 'stats', type: 'text', label: 'Estatísticas' },
      { name: 'image', type: 'image', label: 'Imagem' },
      { name: 'featured', type: 'boolean', label: 'Destaque', defaultValue: false },
    ]
  },
  {
    slug: 'jobs',
    label: 'Vaga',
    labelPlural: 'Vagas',
    icon: 'Users',
    hasLocale: true,
    hasSlug: false,
    hasStatus: true,
    governance: 'assisted',
    fields: [
      { name: 'published', type: 'boolean', label: 'Publicado', defaultValue: false },
      { name: 'title', type: 'text', required: true, label: 'Título' },
      { name: 'vertical', type: 'select', label: 'Vertical', options: [
        'engenharia', 'segurança', 'comercial', 'operações', 'dados'
      ]},
      { name: 'location', type: 'text', required: true, label: 'Localização' },
      { name: 'type', type: 'select', label: 'Tipo', options: [
        'Full-time', 'Part-time', 'Freelancer', 'Estágio'
      ]},
      { name: 'desc', type: 'textarea', label: 'Descrição' },
      { name: 'requirements', type: 'json', label: 'Requisitos' },
      { name: 'featured', type: 'boolean', label: 'Destaque', defaultValue: false },
    ]
  },
  {
    slug: 'brandbook',
    label: 'Brand Asset',
    labelPlural: 'Brand Assets',
    icon: 'Palette',
    hasLocale: false,
    hasSlug: true,
    hasStatus: true,
    governance: 'protected',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Nome do Asset' },
      { name: 'category', type: 'select', label: 'Categoria', options: [
        'logo', 'cor', 'tipografia', 'ícone', 'template', 'guideline'
      ]},
      { name: 'brand', type: 'select', label: 'Marca', options: [
        'ness', 'aegis', 'cavan', 'tne', 'canal'
      ]},
      { name: 'desc', type: 'textarea', label: 'Descrição' },
      { name: 'file_url', type: 'text', label: 'URL do Arquivo' },
      { name: 'preview_url', type: 'image', label: 'Preview' },
      { name: 'hex_value', type: 'text', label: 'Hex (cores)' },
      { name: 'usage_notes', type: 'textarea', label: 'Notas de Uso' },
    ]
  },
  {
    slug: 'signatures',
    label: 'Assinatura',
    labelPlural: 'Assinaturas',
    icon: 'Mail',
    hasLocale: false,
    hasSlug: true,
    hasStatus: true,
    governance: 'protected',
    fields: [
      { name: 'name', type: 'text', required: true, label: 'Nome Completo' },
      { name: 'role', type: 'text', required: true, label: 'Cargo' },
      { name: 'email', type: 'text', required: true, label: 'Email' },
      { name: 'phone', type: 'text', label: 'Telefone' },
      { name: 'brand', type: 'select', label: 'Marca', required: true, options: [
        'ness', 'aegis', 'cavan', 'tne'
      ]},
      { name: 'photo_url', type: 'image', label: 'Foto' },
      { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
      { name: 'department', type: 'select', label: 'Departamento', options: [
        'Diretoria', 'Engenharia', 'Comercial', 'Operações', 'RH', 'Financeiro', 'Marketing'
      ]},
    ]
  },
  {
    slug: 'forms',
    label: 'Formulário',
    labelPlural: 'Formulários',
    icon: 'Inbox',
    hasLocale: false,
    hasSlug: false,
    hasStatus: true,
    governance: 'protected',
    fields: [
      { name: 'source', type: 'text', required: true, label: 'Origem' },
      { name: 'payload', type: 'json', required: true, label: 'Dados' },
    ]
  },
  // ── Collections Editoriais (Comunicação Institucional) ──────────
  {
    slug: 'comunicados',
    label: 'Comunicado',
    labelPlural: 'Comunicados',
    icon: 'Megaphone',
    hasLocale: true,
    hasSlug: true,
    hasStatus: true,
    governance: 'assisted',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Título' },
      { name: 'type', type: 'select', label: 'Tipo', options: [
        'posicionamento', 'nota oficial', 'release', 'interno', 'parceria'
      ]},
      { name: 'urgency', type: 'select', label: 'Urgência', options: [
        'baixa', 'média', 'alta', 'crítica'
      ]},
      { name: 'date', type: 'date', required: true, label: 'Data' },
      { name: 'summary', type: 'textarea', required: true, label: 'Resumo' },
      { name: 'body', type: 'richtext', label: 'Conteúdo Completo' },
      { name: 'approved_by', type: 'text', label: 'Aprovado por' },
      { name: 'channels', type: 'json', label: 'Canais de Distribuição' },
    ]
  },
  {
    slug: 'social_posts',
    label: 'Post Social',
    labelPlural: 'Posts Sociais',
    icon: 'Share2',
    hasLocale: true,
    hasSlug: false,
    hasStatus: true,
    governance: 'autonomous',
    fields: [
      { name: 'platform', type: 'select', required: true, label: 'Plataforma', options: [
        'linkedin', 'x', 'instagram', 'facebook', 'threads'
      ]},
      { name: 'content', type: 'textarea', required: true, label: 'Conteúdo' },
      { name: 'hashtags', type: 'text', label: 'Hashtags' },
      { name: 'media_url', type: 'image', label: 'Mídia' },
      { name: 'scheduled_at', type: 'date', label: 'Agendado para' },
      { name: 'cta_url', type: 'text', label: 'Link CTA' },
      { name: 'tone', type: 'select', label: 'Tom', options: [
        'institucional', 'técnico', 'informal', 'thought-leadership'
      ]},
    ]
  },
  {
    slug: 'newsletters',
    label: 'Newsletter',
    labelPlural: 'Newsletters',
    icon: 'Newspaper',
    hasLocale: true,
    hasSlug: true,
    hasStatus: true,
    governance: 'assisted',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Assunto' },
      { name: 'preheader', type: 'text', label: 'Pré-header' },
      { name: 'body', type: 'richtext', required: true, label: 'Corpo do Email' },
      { name: 'audience', type: 'select', label: 'Audiência', options: [
        'clientes', 'prospects', 'parceiros', 'interno', 'todos'
      ]},
      { name: 'scheduled_at', type: 'date', label: 'Agendado para' },
      { name: 'cta_text', type: 'text', label: 'Texto do CTA' },
      { name: 'cta_url', type: 'text', label: 'URL do CTA' },
      { name: 'cover', type: 'image', label: 'Imagem de Capa' },
    ]
  },
  // ── Modulos Específicos ──────────────────────────────────────────
  {
    slug: 'pages',
    label: 'Página',
    labelPlural: 'Páginas',
    icon: 'Layout',
    hasLocale: true,
    hasSlug: true,
    hasStatus: true,
    governance: 'protected',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Título' },
      { name: 'desc', type: 'textarea', label: 'Descrição/Meta' },
      { name: 'body', type: 'richtext', label: 'Conteúdo' },
      { name: 'template', type: 'select', label: 'Template', options: ['default', 'landing', 'contact', 'about'] }
    ]
  },
  {
    slug: 'authors',
    label: 'Autor',
    labelPlural: 'Autores',
    icon: 'User',
    hasLocale: false,
    hasSlug: true,
    hasStatus: true,
    governance: 'protected',
    fields: [
      { name: 'name', type: 'text', required: true, label: 'Nome' },
      { name: 'role', type: 'text', label: 'Cargo' },
      { name: 'bio', type: 'textarea', label: 'Bio Curtinha' },
      { name: 'avatar', type: 'image', label: 'Avatar' },
      { name: 'social_link', type: 'text', label: 'Link (LinkedIn)' }
    ]
  },
  // ── Publicações & Resultados (RI / Transparência) ──────────────
  {
    slug: 'publications',
    label: 'Publicação',
    labelPlural: 'Publicações',
    icon: 'BarChart3',
    hasLocale: true,
    hasSlug: true,
    hasStatus: true,
    governance: 'assisted',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Título' },
      { name: 'category', type: 'select', label: 'Categoria', options: [
        'resultado-financeiro', 'relatorio-anual', 'relatorio-sustentabilidade',
        'governanca', 'ata-assembleia', 'fato-relevante',
        'apresentacao-investidores', 'documento-institucional', 'outro'
      ]},
      { name: 'fiscal_year', type: 'text', label: 'Ano Fiscal' },
      { name: 'fiscal_period', type: 'select', label: 'Período', options: [
        '1T', '2T', '3T', '4T', '1S', '2S', 'Anual', 'N/A'
      ]},
      { name: 'date', type: 'date', required: true, label: 'Data de Publicação' },
      { name: 'summary', type: 'textarea', label: 'Resumo Executivo' },
      { name: 'file_url', type: 'text', label: 'URL do Documento (PDF/Excel)' },
      { name: 'cover', type: 'image', label: 'Thumbnail/Capa' },
      { name: 'featured', type: 'boolean', label: 'Destaque', defaultValue: false },
    ]
  },
]

/** Busca uma collection por slug */
export function getCollection(slug: string): CollectionDef | undefined {
  return collections.find(c => c.slug === slug)
}

/** Retorna os campos obrigatórios de uma collection */
export function getRequiredFields(col: CollectionDef): string[] {
  return col.fields.filter(f => f.required).map(f => f.name)
}
