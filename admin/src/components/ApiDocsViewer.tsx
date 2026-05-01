import React from 'react';
import ReactMarkdown from 'react-markdown';

const MD_CONTENT = `
# Guia de Integração e Consumo de API (Headless)

Bem-vindo ao Guia de Integração da sua Organização. Este documento detalha as estruturas de dados suportadas e ensina como realizar a conexão via frontend seguro para ler seus dados sem atrito.

---

## 1. Conexão Básica e Autenticação

Para sites públicos consumirem os dados gerenciados aqui, utilize a nossa Base API. Esta URL direcionará ao banco de forma segura.

### Como se autenticar
A integração server-side ocorre injetando o Token API (gerado ao lado) nos **Cabeçalhos (Headers)** da sua requisição HTTP:

\`\`\`javascript
const response = await fetch("https://canal.ness.com.br/api/v1/collections/insights/entries", {
  method: "GET",
  headers: {
    "Authorization": "Bearer sk_suachave_aqui",
    "Content-Type": "application/json"
  }
});
const { data, meta } = await response.json();
\`\`\`

---

## 2. API de Conteúdo (CRUD)

### Listar Entradas (List Entries)
**GET** \`/api/v1/collections/:slug/entries\`

Parâmetros de Query Dinâmicos:
- \`?locale={lang}\`: Padrão \`'pt'\`.
- \`?page={number}\`: Paginação
- \`?limit={number}\`: Quantidade por página

### Consultar Entrada Específica (Get Entry)
**GET** \`/api/v1/collections/:slug/entries/:id-ou-slug\`

---

## 3. Catálogo de Dados (Collections)
Os dados trafegam aderindo a um JSON schema fixo governado pelo CMS.

### 📄 Insights (Blog Institucional)
\`slug: 'insights'\`
- \`title\` *(String / Obrigatório)*: Título da publicação.
- \`date\` *(Date / Obrigatório)*: Data de emissão.
- \`desc\` *(String)*: Linha fina ou resumo.
- \`body\` *(RichText / HTML)*: Corpo central do post.
- \`tag\` *(String)*: Categoria (ex: 'Tecnologia', 'IA').
- \`cover\` *(Apenas URL)*: Caminho da imagem.

### 💼 Cases (Portfólio / Projetos)
\`slug: 'cases'\`
- \`client\`, \`project\` *(Strings Obrigatórias)*.
- \`category\` *(String)*.
- \`stats\` *(String)*: Indicador numérico ou quantitativo.
- \`image\` *(Apenas URL)*.

### 👥 Jobs (Vagas)
\`slug: 'jobs'\`
- \`title\`, \`location\` *(Strings Obrigatórias)*.
- \`vertical\` *(String)*: Departamento.
- \`requirements\` *(Array JSON)*.

### 📣 Comunicados (PR Corporativo)
\`slug: 'comunicados'\`
- \`title\`, \`date\`, \`summary\` *(Obrigatórios)*.
- \`type\` *(String)*.
- \`channels\` *(Array JSON)*.

---

## 4. Submissão de Leads (Formulários)
Envie dados capturados no seu site de volta para sua organização:
**POST** \`/api/v1/collections/forms/entries\` 

**Payload Exigido:** 
Seu JSON precisa contar com uma chave \`source\` (indicando de onde veio o lead) e um objeto \`payload\` puro.
`;

export function ApiDocsViewer() {
  return (
    <div className="api-docs-container">
      <style>{`
        .markdown-body {
          font-family: var(--font-sans);
          line-height: 1.6;
          color: var(--text);
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 24px;
          border-radius: var(--radius-md);
        }
        .markdown-body h1 {
          font-size: 20px;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
          color: var(--accent);
          letter-spacing: -0.02em;
        }
        .markdown-body h2 {
          font-size: 16px;
          margin-top: 32px;
          margin-bottom: 16px;
          color: var(--text);
          font-weight: 600;
        }
        .markdown-body h3 {
          font-size: 14px;
          margin-top: 24px;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .markdown-body p { margin-bottom: 12px; font-size: 14px; color: var(--text-muted); }
        .markdown-body ul { padding-left: 20px; margin-bottom: 16px; font-size: 14px; color: var(--text-muted); }
        .markdown-body li { margin-bottom: 6px; }
        .markdown-body code {
          background: rgba(0,0,0, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text);
          border: 1px solid var(--border);
        }
        .markdown-body pre {
          background: var(--bg);
          padding: 16px;
          border-radius: var(--radius-md);
          overflow-x: auto;
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }
        .markdown-body pre code {
          background: transparent;
          padding: 0;
          border: none;
          color: var(--accent-light);
          font-size: 13px;
        }
        .markdown-body hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 32px 0;
        }
      `}</style>
      <div className="markdown-body">
        <ReactMarkdown>{MD_CONTENT}</ReactMarkdown>
      </div>
    </div>
  );
}
