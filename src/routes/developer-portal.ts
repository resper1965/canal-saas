/**
 * Canal CMS — Developer Portal
 * 
 * Landing page pública para devs frontend.
 * Mostra como integrar um site ao Canal CMS via API.
 */

import { Hono } from 'hono'
import type { Bindings } from '../index'

type PortalEnv = { Bindings: Bindings }

export const developerPortal = new Hono<PortalEnv>()

developerPortal.get('/developers', (c) => {
  const baseUrl = c.env.BETTER_AUTH_URL || 'https://canal.bekaa.eu'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canal CMS — Developer Portal</title>
  <meta name="description" content="Integre seu site ao Canal CMS em minutos. API REST, exemplos em JavaScript, React e cURL.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #06060a;
      --surface: #0c0c14;
      --surface-2: #12121e;
      --border: #1a1a2e;
      --border-active: #00E5A044;
      --text: #e4e4ef;
      --text-muted: #8888a4;
      --accent: #00E5A0;
      --accent-dim: #00E5A033;
      --blue: #0099FF;
      --orange: #FFB800;
      --red: #FF4466;
      --radius: 12px;
      --font: 'Inter', system-ui, -apple-system, sans-serif;
      --mono: 'JetBrains Mono', 'Fira Code', monospace;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Layout ─────────────────────────── */
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ── Hero ───────────────────────────── */
    .hero {
      text-align: center;
      padding: 80px 24px 60px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 600px;
      background: radial-gradient(ellipse, var(--accent-dim) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: var(--accent-dim);
      border: 1px solid var(--border-active);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 24px;
    }
    .hero-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .hero h1 {
      font-size: clamp(32px, 5vw, 52px);
      font-weight: 800;
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-bottom: 16px;
      position: relative;
    }
    .hero h1 span { color: var(--accent); }
    .hero p {
      font-size: 18px;
      color: var(--text-muted);
      max-width: 560px;
      margin: 0 auto 32px;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font);
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      border: none;
    }
    .btn-primary {
      background: var(--accent);
      color: #000;
    }
    .btn-primary:hover {
      background: #00ffb3;
      box-shadow: 0 0 24px var(--accent-dim);
    }
    .btn-secondary {
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      border-color: var(--accent);
      background: var(--surface);
    }

    /* ── Steps ──────────────────────────── */
    .steps {
      padding: 60px 0;
    }
    .steps h2 {
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 48px;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }
    .step-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      transition: border-color 0.3s, transform 0.3s;
    }
    .step-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }
    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--accent-dim);
      color: var(--accent);
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .step-card h3 {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .step-card p {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* ── Code Examples ──────────────────── */
    .examples {
      padding: 60px 0;
    }
    .examples h2 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .examples > .container > p {
      color: var(--text-muted);
      margin-bottom: 32px;
      font-size: 15px;
    }
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-bottom: none;
      border-radius: var(--radius) var(--radius) 0 0;
      padding: 6px 6px 0;
    }
    .tab {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      font-family: var(--font);
      color: var(--text-muted);
      background: transparent;
      border: none;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab:hover { color: var(--text); }
    .tab.active {
      background: var(--surface-2);
      color: var(--accent);
    }
    .code-panels {
      position: relative;
    }
    .code-panel {
      display: none;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-top: none;
      border-radius: 0 0 var(--radius) var(--radius);
      overflow: hidden;
    }
    .code-panel.active { display: block; }
    .code-panel pre {
      margin: 0;
      padding: 24px;
      overflow-x: auto;
      font-family: var(--mono);
      font-size: 13px;
      line-height: 1.7;
      color: var(--text);
    }
    .code-panel .comment { color: #555570; }
    .code-panel .keyword { color: var(--blue); }
    .code-panel .string { color: var(--accent); }
    .code-panel .func { color: var(--orange); }
    .code-panel .variable { color: #cc99ff; }
    .code-panel .method { color: var(--blue); }

    /* ── Endpoints Table ────────────────── */
    .endpoints {
      padding: 60px 0;
    }
    .endpoints h2 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .endpoints > .container > p {
      color: var(--text-muted);
      margin-bottom: 32px;
      font-size: 15px;
    }
    .endpoint-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .endpoint-table th {
      text-align: left;
      padding: 14px 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
    }
    .endpoint-table td {
      padding: 14px 20px;
      font-size: 14px;
      border-bottom: 1px solid var(--border);
    }
    .endpoint-table tr:last-child td { border-bottom: none; }
    .endpoint-table tr:hover td { background: var(--surface-2); }
    .method-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--mono);
    }
    .method-get { background: #00E5A018; color: var(--accent); }
    .method-post { background: #0099FF18; color: var(--blue); }
    .method-put { background: #FFB80018; color: var(--orange); }
    .method-delete { background: #FF446618; color: var(--red); }
    .path-code {
      font-family: var(--mono);
      font-size: 13px;
      color: var(--text);
    }
    .auth-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .auth-key { background: var(--accent-dim); color: var(--accent); }
    .auth-session { background: #FFB80018; color: var(--orange); }
    .auth-public { background: #ffffff0a; color: var(--text-muted); }

    /* ── Widget Preview ─────────────────── */
    .widget-section {
      padding: 60px 0;
    }
    .widget-section h2 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .widget-section > .container > p {
      color: var(--text-muted);
      margin-bottom: 32px;
      font-size: 15px;
    }
    .widget-demo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: start;
    }
    @media (max-width: 700px) {
      .widget-demo { grid-template-columns: 1fr; }
    }
    .widget-preview {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
    }
    .widget-mock {
      background: var(--surface-2);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .widget-mock-header {
      background: linear-gradient(135deg, #00E5A0, #00c88a);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .widget-mock-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #000;
    }
    .widget-mock-name {
      font-size: 14px;
      font-weight: 600;
      color: #000;
    }
    .widget-mock-status {
      font-size: 11px;
      color: rgba(0,0,0,0.5);
    }
    .widget-mock-body {
      padding: 20px;
      min-height: 180px;
    }
    .widget-mock-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .widget-mock-msg.bot {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
    }
    .widget-mock-msg.user {
      background: var(--accent-dim);
      border: 1px solid var(--border-active);
      color: var(--text);
      margin-left: auto;
    }
    .widget-mock-input {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--border);
    }
    .widget-mock-input input {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text);
      font-size: 13px;
      font-family: var(--font);
      outline: none;
    }
    .widget-mock-input button {
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      color: #000;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    /* ── Footer ─────────────────────────── */
    footer {
      text-align: center;
      padding: 48px 24px;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 13px;
    }
    footer a {
      color: var(--accent);
      text-decoration: none;
    }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-badge">Developer Portal</div>
    <h1>Conecte seu site ao <span>Canal</span><span style="color:var(--text)">.</span>CMS</h1>
    <p>API REST headless, multi-tenant. Busque conteúdo, envie formulários e integre chatbot em minutos.</p>
    <div class="hero-actions">
      <a href="/api/docs" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
        API Reference
      </a>
      <a href="#quickstart" class="btn btn-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>
        Quick Start
      </a>
    </div>
  </div>
</section>

<!-- ═══ GETTING STARTED ═══ -->
<section class="steps" id="quickstart">
  <div class="container">
    <h2>Como integrar em 3 passos</h2>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-num">1</div>
        <h3>Crie uma conta</h3>
        <p>Acesse o admin panel e crie sua organização. Cada tenant tem seu conteúdo 100% isolado.</p>
      </div>
      <div class="step-card">
        <div class="step-num">2</div>
        <h3>Gere uma API Key</h3>
        <p>Em <strong>SaaS Settings → Developer API</strong>, gere uma chave <code>pk_xxx</code>. Ela só aparece uma vez.</p>
      </div>
      <div class="step-card">
        <div class="step-num">3</div>
        <h3>Faça um fetch</h3>
        <p>Use a API key no header <code>Authorization: Bearer pk_xxx</code> para buscar conteúdo no seu frontend.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CODE EXAMPLES ═══ -->
<section class="examples" id="examples">
  <div class="container">
    <h2>Exemplos de Integração</h2>
    <p>Copie e cole no seu projeto. Substitua <code>pk_YOUR_API_KEY</code> pela sua chave.</p>

    <div class="tabs" role="tablist">
      <button class="tab active" data-panel="js" role="tab" aria-selected="true">JavaScript</button>
      <button class="tab" data-panel="react" role="tab">React</button>
      <button class="tab" data-panel="curl" role="tab">cURL</button>
    </div>

    <div class="code-panels">
      <!-- JavaScript -->
      <div class="code-panel active" id="panel-js">
        <pre><span class="comment">// Buscar posts publicados</span>
<span class="keyword">const</span> <span class="variable">API_KEY</span> = <span class="string">'pk_YOUR_API_KEY'</span>
<span class="keyword">const</span> <span class="variable">BASE</span>   = <span class="string">'${baseUrl}'</span>

<span class="keyword">async function</span> <span class="func">getPosts</span>() {
  <span class="keyword">const</span> res = <span class="keyword">await</span> <span class="func">fetch</span>(
    <span class="string">\`\${BASE}/api/v1/collections/insights/entries?status=published&limit=10\`</span>,
    { headers: { <span class="string">'Authorization'</span>: <span class="string">\`Bearer \${API_KEY}\`</span> } }
  )
  <span class="keyword">const</span> { data, meta } = <span class="keyword">await</span> res.<span class="method">json</span>()
  <span class="keyword">return</span> { data, meta }
}

<span class="comment">// Buscar um post por slug</span>
<span class="keyword">async function</span> <span class="func">getPost</span>(<span class="variable">slug</span>) {
  <span class="keyword">const</span> res = <span class="keyword">await</span> <span class="func">fetch</span>(
    <span class="string">\`\${BASE}/api/v1/collections/insights/entries/\${slug}\`</span>,
    { headers: { <span class="string">'Authorization'</span>: <span class="string">\`Bearer \${API_KEY}\`</span> } }
  )
  <span class="keyword">return</span> res.<span class="method">json</span>()
}

<span class="comment">// Enviar formulário de contato</span>
<span class="keyword">async function</span> <span class="func">submitContact</span>(<span class="variable">formData</span>) {
  <span class="keyword">return</span> <span class="func">fetch</span>(<span class="string">\`\${BASE}/api/v1/collections/forms/entries\`</span>, {
    method: <span class="string">'POST'</span>,
    headers: {
      <span class="string">'Authorization'</span>: <span class="string">\`Bearer \${API_KEY}\`</span>,
      <span class="string">'Content-Type'</span>: <span class="string">'application/json'</span>
    },
    body: JSON.<span class="method">stringify</span>({ source: <span class="string">'site-contato'</span>, payload: formData })
  })
}</pre>
      </div>

      <!-- React -->
      <div class="code-panel" id="panel-react">
        <pre><span class="keyword">import</span> { useState, useEffect } <span class="keyword">from</span> <span class="string">'react'</span>

<span class="keyword">const</span> <span class="variable">API_KEY</span> = <span class="string">'pk_YOUR_API_KEY'</span>
<span class="keyword">const</span> <span class="variable">BASE</span>   = <span class="string">'${baseUrl}'</span>

<span class="keyword">function</span> <span class="func">useEntries</span>(<span class="variable">collection</span>, <span class="variable">options</span> = {}) {
  <span class="keyword">const</span> [data, setData] = <span class="func">useState</span>([])
  <span class="keyword">const</span> [loading, setLoading] = <span class="func">useState</span>(<span class="keyword">true</span>)

  <span class="func">useEffect</span>(() => {
    <span class="keyword">const</span> params = <span class="keyword">new</span> URLSearchParams({
      status: <span class="string">'published'</span>,
      limit: String(options.limit || 20),
      ...options.params,
    })

    <span class="func">fetch</span>(<span class="string">\`\${BASE}/api/v1/collections/\${collection}/entries?\${params}\`</span>, {
      headers: { <span class="string">'Authorization'</span>: <span class="string">\`Bearer \${API_KEY}\`</span> }
    })
      .<span class="method">then</span>(r => r.<span class="method">json</span>())
      .<span class="method">then</span>(res => { setData(res.data); setLoading(<span class="keyword">false</span>) })
  }, [collection])

  <span class="keyword">return</span> { data, loading }
}

<span class="comment">// Componente de exemplo</span>
<span class="keyword">export function</span> <span class="func">InsightsList</span>() {
  <span class="keyword">const</span> { data: posts, loading } = <span class="func">useEntries</span>(<span class="string">'insights'</span>, { limit: 6 })

  <span class="keyword">if</span> (loading) <span class="keyword">return</span> &lt;p&gt;Carregando...&lt;/p&gt;

  <span class="keyword">return</span> (
    &lt;div className=<span class="string">"grid grid-cols-3 gap-4"</span>&gt;
      {posts.<span class="method">map</span>(post => (
        &lt;article key={post.id}&gt;
          &lt;h2&gt;{post.title}&lt;/h2&gt;
          &lt;p&gt;{post.desc}&lt;/p&gt;
        &lt;/article&gt;
      ))}
    &lt;/div&gt;
  )
}</pre>
      </div>

      <!-- cURL -->
      <div class="code-panel" id="panel-curl">
        <pre><span class="comment"># Listar collections disponíveis</span>
<span class="func">curl</span> <span class="string">${baseUrl}/api/v1/collections</span> \\
  -H <span class="string">"Authorization: Bearer pk_YOUR_API_KEY"</span>

<span class="comment"># Buscar insights publicados (página 1, 10 por página)</span>
<span class="func">curl</span> <span class="string">"${baseUrl}/api/v1/collections/insights/entries?status=published&limit=10"</span> \\
  -H <span class="string">"Authorization: Bearer pk_YOUR_API_KEY"</span>

<span class="comment"># Buscar um insight por slug</span>
<span class="func">curl</span> <span class="string">${baseUrl}/api/v1/collections/insights/entries/meu-post</span> \\
  -H <span class="string">"Authorization: Bearer pk_YOUR_API_KEY"</span>

<span class="comment"># Buscar cases com locale em inglês</span>
<span class="func">curl</span> <span class="string">"${baseUrl}/api/v1/collections/cases/entries?locale=en&status=published"</span> \\
  -H <span class="string">"Authorization: Bearer pk_YOUR_API_KEY"</span>

<span class="comment"># Upload de media (requer sessão, não API key)</span>
<span class="func">curl</span> -X POST <span class="string">${baseUrl}/api/v1/media/upload</span> \\
  -H <span class="string">"Cookie: better_auth_session=YOUR_SESSION"</span> \\
  -F <span class="string">"file=@./imagem.jpg"</span></pre>
      </div>
    </div>
  </div>
</section>

<!-- ═══ ENDPOINTS TABLE ═══ -->
<section class="endpoints" id="endpoints">
  <div class="container">
    <h2>Endpoints Principais</h2>
    <p>Veja a <a href="/api/docs" style="color:var(--accent)">API Reference completa</a> para todos os detalhes, schemas e playground interativo.</p>

    <table class="endpoint-table">
      <thead>
        <tr>
          <th>Método</th>
          <th>Endpoint</th>
          <th>Descrição</th>
          <th>Auth</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td class="path-code">/api/v1/collections</td>
          <td>Listar todas as collections</td>
          <td><span class="auth-badge auth-key">API Key</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td class="path-code">/api/v1/collections/{slug}/entries</td>
          <td>Listar entries (paginado, filtros)</td>
          <td><span class="auth-badge auth-key">API Key</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td class="path-code">/api/v1/collections/{slug}/entries/{id}</td>
          <td>Entry por ID ou slug</td>
          <td><span class="auth-badge auth-key">API Key</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-post">POST</span></td>
          <td class="path-code">/api/v1/collections/{slug}/entries</td>
          <td>Criar entry</td>
          <td><span class="auth-badge auth-session">Session</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-put">PUT</span></td>
          <td class="path-code">/api/v1/collections/{slug}/entries/{id}</td>
          <td>Atualizar entry</td>
          <td><span class="auth-badge auth-session">Session</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-delete">DELETE</span></td>
          <td class="path-code">/api/v1/collections/{slug}/entries/{id}</td>
          <td>Deletar entry</td>
          <td><span class="auth-badge auth-session">Session</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-post">POST</span></td>
          <td class="path-code">/api/v1/media/upload</td>
          <td>Upload de arquivo</td>
          <td><span class="auth-badge auth-session">Session</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td class="path-code">/api/chatbot-config?tenant=xxx</td>
          <td>Config do chatbot</td>
          <td><span class="auth-badge auth-public">Público</span></td>
        </tr>
        <tr>
          <td><span class="method-badge method-post">POST</span></td>
          <td class="path-code">/api/chat</td>
          <td>Enviar mensagem ao chatbot AI</td>
          <td><span class="auth-badge auth-public">Público</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ═══ CHATBOT WIDGET ═══ -->
<section class="widget-section" id="widget">
  <div class="container">
    <h2>Chatbot Embeddable (em breve)</h2>
    <p>Cole uma linha de código e tenha um assistente AI no seu site — alimentado pelo conteúdo do Canal.</p>

    <div class="widget-demo">
      <div class="widget-preview">
        <div class="widget-mock">
          <div class="widget-mock-header">
            <div class="widget-mock-avatar">G</div>
            <div>
              <div class="widget-mock-name">Gabi.OS</div>
              <div class="widget-mock-status">Online • Powered by Canal</div>
            </div>
          </div>
          <div class="widget-mock-body">
            <div class="widget-mock-msg bot">Olá! 👋 Como posso ajudar? Conheço todos os serviços e soluções disponíveis.</div>
            <div class="widget-mock-msg user">Quais soluções vocês oferecem em cibersegurança?</div>
            <div class="widget-mock-msg bot">Ótima pergunta! Oferecemos SOC 24/7, pentest, gestão de vulnerabilidades e programas de conscientização...</div>
          </div>
          <div class="widget-mock-input">
            <input type="text" placeholder="Digite sua pergunta..." disabled>
            <button disabled>Enviar</button>
          </div>
        </div>
      </div>

      <div>
        <div class="tabs" role="tablist" style="border-radius: var(--radius) var(--radius) 0 0;">
          <button class="tab active" style="pointer-events:none;">HTML</button>
        </div>
        <div class="code-panel active" style="border-radius: 0 0 var(--radius) var(--radius);">
          <pre><span class="comment">&lt;!-- Adicione antes do &lt;/body&gt; --&gt;</span>
<span class="keyword">&lt;script</span>
  <span class="variable">src</span>=<span class="string">"${baseUrl}/widget.js"</span>
  <span class="variable">data-key</span>=<span class="string">"pk_YOUR_API_KEY"</span>
<span class="keyword">&gt;&lt;/script&gt;</span>

<span class="comment">&lt;!-- Customizar posição e tema --&gt;</span>
<span class="keyword">&lt;canal-chat</span>
  <span class="variable">position</span>=<span class="string">"bottom-right"</span>
  <span class="variable">theme</span>=<span class="string">"dark"</span>
<span class="keyword">&gt;&lt;/canal-chat&gt;</span></pre>
        </div>

        <div style="margin-top: 20px; padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
            <strong style="color: var(--orange);">⚠️ SDK em Desenvolvimento</strong>
          </p>
          <p style="font-size: 13px; color: var(--text-muted);">
            O widget e o SDK JavaScript (<code>@canal/sdk</code>) estão previstos para a Fase 2 do roadmap.
            Por enquanto, use <code>fetch()</code> diretamente com a API REST.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <p>Canal<span style="color:var(--accent)">.</span>CMS — Headless CMS Multi-Tenant</p>
  <p style="margin-top: 8px;">
    <a href="/api/docs">API Docs</a> · 
    <a href="/api/openapi.json">OpenAPI Spec</a> · 
    <a href="${baseUrl}">Dashboard</a>
  </p>
</footer>

<script>
  // Tab switching
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const panel = tab.dataset.panel
        if (!panel) return

        tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        tab.classList.add('active')

        const panels = tabGroup.nextElementSibling
        if (!panels) return
        panels.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'))
        const target = panels.querySelector('#panel-' + panel)
        if (target) target.classList.add('active')
      })
    })
  })
</script>

</body>
</html>`

  return c.html(html)
})
