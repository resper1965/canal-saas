/**
 * Canal CMS — Embeddable Chat Widget
 * 
 * Web Component <canal-chat> que pode ser inserido em qualquer site.
 * Conecta ao GabiAgent (Durable Object) via streaming POST.
 * 
 * Uso:
 *   <script src="https://canal.ness.com.br/widget.js" data-key="pk_xxx"></script>
 *   <canal-chat position="bottom-right" theme="dark"></canal-chat>
 * 
 * Servido como inline JavaScript pelo worker em GET /widget.js
 */

const WIDGET_CSS = `
  :host {
    --canal-accent: #00E5A0;
    --canal-bg: #0c0c14;
    --canal-surface: #12121e;
    --canal-border: #1a1a2e;
    --canal-text: #e4e4ef;
    --canal-text-muted: #8888a4;
    --canal-radius: 16px;
    --canal-font: 'Inter', system-ui, -apple-system, sans-serif;
    
    position: fixed;
    z-index: 999999;
    font-family: var(--canal-font);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  :host([position="bottom-right"]), :host(:not([position])) {
    bottom: 24px; right: 24px;
  }
  :host([position="bottom-left"]) {
    bottom: 24px; left: 24px;
  }

  :host([theme="light"]) {
    --canal-bg: #ffffff;
    --canal-surface: #f5f5f7;
    --canal-border: #e0e0e4;
    --canal-text: #1a1a1a;
    --canal-text-muted: #666;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .canal-fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .canal-fab:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 32px rgba(0,229,160,0.25);
  }
  .canal-fab svg {
    width: 24px; height: 24px;
    transition: opacity 0.15s;
  }
  .canal-fab .icon-close { display: none; }
  .canal-fab.open .icon-chat { display: none; }
  .canal-fab.open .icon-close { display: block; }

  .canal-panel {
    display: none;
    position: absolute;
    bottom: 72px;
    right: 0;
    width: 380px;
    max-width: calc(100vw - 32px);
    height: 520px;
    max-height: calc(100vh - 120px);
    background: var(--canal-bg);
    border: 1px solid var(--canal-border);
    border-radius: var(--canal-radius);
    overflow: hidden;
    flex-direction: column;
    box-shadow: 0 16px 64px rgba(0,0,0,0.4);
    animation: canal-slide-up 0.25s ease-out;
  }

  :host([position="bottom-left"]) .canal-panel {
    right: auto; left: 0;
  }

  .canal-panel.open { display: flex; }

  @keyframes canal-slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .canal-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--canal-border);
    flex-shrink: 0;
  }
  .canal-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }
  .canal-header-info { flex: 1; min-width: 0; }
  .canal-header-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--canal-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .canal-header-status {
    font-size: 11px;
    color: var(--canal-text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .canal-header-status::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--canal-accent);
    animation: canal-pulse 2s infinite;
  }
  @keyframes canal-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .canal-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .canal-messages::-webkit-scrollbar { width: 4px; }
  .canal-messages::-webkit-scrollbar-thumb {
    background: var(--canal-border);
    border-radius: 4px;
  }

  .canal-msg {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13px;
    line-height: 1.6;
    word-wrap: break-word;
    animation: canal-msg-in 0.2s ease-out;
  }
  @keyframes canal-msg-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .canal-msg.bot {
    background: var(--canal-surface);
    border: 1px solid var(--canal-border);
    color: var(--canal-text);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  .canal-msg.user {
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    color: #000;
  }
  .canal-msg.typing {
    opacity: 0.7;
    font-style: italic;
    font-size: 12px;
  }

  .canal-input-area {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--canal-border);
    flex-shrink: 0;
    background: var(--canal-bg);
  }
  .canal-input {
    flex: 1;
    background: var(--canal-surface);
    border: 1px solid var(--canal-border);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--canal-text);
    font-size: 13px;
    font-family: var(--canal-font);
    outline: none;
    transition: border-color 0.2s;
    resize: none;
    min-height: 40px;
    max-height: 80px;
  }
  .canal-input:focus {
    border-color: var(--canal-accent);
  }
  .canal-input::placeholder {
    color: var(--canal-text-muted);
  }
  .canal-send {
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    font-weight: 600;
    font-size: 13px;
    font-family: var(--canal-font);
    cursor: pointer;
    transition: opacity 0.2s;
    flex-shrink: 0;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .canal-send:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .canal-send svg {
    width: 18px; height: 18px;
  }

  .canal-footer {
    text-align: center;
    padding: 6px;
    font-size: 10px;
    color: var(--canal-text-muted);
    border-top: 1px solid var(--canal-border);
    flex-shrink: 0;
  }
  .canal-footer a {
    color: var(--canal-accent);
    text-decoration: none;
  }

  @media (max-width: 420px) {
    .canal-panel {
      width: calc(100vw - 16px);
      height: calc(100vh - 100px);
      bottom: 68px;
      right: -16px;
    }
    :host([position="bottom-left"]) .canal-panel {
      left: -16px;
    }
  }
`;

class CanalChatWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private apiKey: string = '';
  private baseUrl: string = '';
  private botConfig: { bot_name: string; welcome_message: string; theme_color: string; avatar_url: string } = {
    bot_name: 'Gabi.OS',
    welcome_message: 'Olá! 👋 Como posso ajudar?',
    theme_color: '#00E5A0',
    avatar_url: '',
  };
  private isStreaming = false;
  private sessionId: string;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.sessionId = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  static get observedAttributes() {
    return ['position', 'theme', 'data-key', 'data-base-url'];
  }

  connectedCallback() {
    // Resolve API key from attribute or parent script tag
    this.apiKey = this.getAttribute('data-key') || this.resolveKeyFromScript();
    this.baseUrl = this.getAttribute('data-base-url') || this.resolveBaseFromScript();

    this.render();
    this.loadConfig();
  }

  private resolveKeyFromScript(): string {
    const script = document.querySelector('script[data-key][src*="widget"]') as HTMLScriptElement;
    return script?.dataset.key || '';
  }

  private resolveBaseFromScript(): string {
    const script = document.querySelector('script[src*="widget"]') as HTMLScriptElement;
    if (!script?.src) return '';
    try {
      const url = new URL(script.src);
      return url.origin;
    } catch {
      return '';
    }
  }

  private async loadConfig() {
    if (!this.baseUrl) return;
    try {
      const res = await fetch(`${this.baseUrl}/api/chatbot-config`);
      if (res.ok) {
        const config = await res.json();
        if (config.bot_name) this.botConfig.bot_name = config.bot_name;
        if (config.welcome_message) this.botConfig.welcome_message = config.welcome_message;
        if (config.theme_color) this.botConfig.theme_color = config.theme_color;
        if (config.avatar_url) this.botConfig.avatar_url = config.avatar_url;
        this.updateUI();
      }
    } catch { /* use defaults */ }
  }

  private render() {
    const accent = this.botConfig.theme_color;
    const initial = this.botConfig.bot_name.charAt(0).toUpperCase();

    this.shadow.innerHTML = `
      <style>${WIDGET_CSS}</style>

      <div class="canal-panel" id="panel">
        <div class="canal-header">
          <div class="canal-avatar" id="avatar" style="background:${accent};color:#000;">${initial}</div>
          <div class="canal-header-info">
            <div class="canal-header-name" id="bot-name">${this.botConfig.bot_name}</div>
            <div class="canal-header-status">Online</div>
          </div>
        </div>
        <div class="canal-messages" id="messages">
          <div class="canal-msg bot">${this.botConfig.welcome_message}</div>
        </div>
        <div class="canal-input-area">
          <input class="canal-input" id="input" type="text" placeholder="Digite sua mensagem..." autocomplete="off">
          <button class="canal-send" id="send" style="background:${accent};" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          </button>
        </div>
        <div class="canal-footer">
          Powered by <a href="${this.baseUrl}/api/developers" target="_blank">Canal CMS</a>
        </div>
      </div>

      <button class="canal-fab" id="fab" style="background:${accent};" aria-label="Open chat">
        <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    this.bindEvents();
  }

  private updateUI() {
    const accent = this.botConfig.theme_color;
    const initial = this.botConfig.bot_name.charAt(0).toUpperCase();

    const avatar = this.shadow.getElementById('avatar');
    const botName = this.shadow.getElementById('bot-name');
    const fab = this.shadow.getElementById('fab') as HTMLButtonElement;
    const send = this.shadow.getElementById('send') as HTMLButtonElement;

    if (avatar) avatar.style.background = accent;
    if (avatar) avatar.textContent = initial;
    if (botName) botName.textContent = this.botConfig.bot_name;
    if (fab) fab.style.background = accent;
    if (send) send.style.background = accent;
  }

  private bindEvents() {
    const fab = this.shadow.getElementById('fab')!;
    const panel = this.shadow.getElementById('panel')!;
    const input = this.shadow.getElementById('input') as HTMLInputElement;
    const send = this.shadow.getElementById('send') as HTMLButtonElement;

    fab.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      fab.classList.toggle('open', isOpen);
      if (isOpen) input.focus();
    });

    input.addEventListener('input', () => {
      send.disabled = !input.value.trim() || this.isStreaming;
    });

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    send.addEventListener('click', () => this.sendMessage());
  }

  private async sendMessage() {
    const input = this.shadow.getElementById('input') as HTMLInputElement;
    const text = input.value.trim();
    if (!text || this.isStreaming) return;

    // Add user message
    this.messages.push({ role: 'user', content: text });
    this.appendMsg('user', text);
    input.value = '';
    (this.shadow.getElementById('send') as HTMLButtonElement).disabled = true;

    // Streaming response
    this.isStreaming = true;
    const typingEl = this.appendMsg('bot typing', '...');

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId,
        },
        body: JSON.stringify({ messages: this.messages }),
      });

      if (!res.ok) {
        typingEl.textContent = 'Desculpe, ocorreu um erro. Tente novamente.';
        typingEl.classList.remove('typing');
        this.isStreaming = false;
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = '';
      typingEl.textContent = '';
      typingEl.classList.remove('typing');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        typingEl.textContent = fullText;
        this.scrollToBottom();
      }

      this.messages.push({ role: 'assistant', content: fullText });
    } catch {
      typingEl.textContent = 'Erro de conexão. Tente novamente.';
      typingEl.classList.remove('typing');
    }

    this.isStreaming = false;
  }

  private appendMsg(className: string, text: string): HTMLDivElement {
    const container = this.shadow.getElementById('messages')!;
    const div = document.createElement('div');
    div.className = `canal-msg ${className}`;
    div.textContent = text;

    // Set user message color from accent
    if (className === 'user') {
      div.style.background = this.botConfig.theme_color;
    }

    container.appendChild(div);
    this.scrollToBottom();
    return div;
  }

  private scrollToBottom() {
    const container = this.shadow.getElementById('messages')!;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }
}

// Auto-register
if (!customElements.get('canal-chat')) {
  customElements.define('canal-chat', CanalChatWidget);
}

// Auto-create element if script has data-key but no <canal-chat> exists
if (typeof document !== 'undefined') {
  requestAnimationFrame(() => {
    if (!document.querySelector('canal-chat')) {
      const el = document.createElement('canal-chat');
      document.body.appendChild(el);
    }
  });
}
