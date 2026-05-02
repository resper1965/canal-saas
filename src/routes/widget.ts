/**
 * Canal CMS — Widget.js Inline Serve
 * 
 * Serves the chat widget as a self-contained JavaScript file.
 * GET /widget.js → returns compiled widget code inline.
 * 
 * The widget is bundled as an inline string to avoid a build step.
 * In production, this would be pre-built via esbuild/tsup.
 */

import { Hono } from 'hono'
import type { Bindings } from '../index'

type WidgetEnv = { Bindings: Bindings }

export const widgetRoute = new Hono<WidgetEnv>()

widgetRoute.get('/widget.js', async (c) => {
  // Widget source — inlined as JS string
  // In production, this would be pre-compiled and cached in KV/R2
  const baseUrl = c.env.BETTER_AUTH_URL || 'https://canal.bekaa.eu'

  const widgetJs = `
(function() {
  'use strict';

  const WIDGET_CSS = \`
    :host {
      --canal-accent: #00E5A0;
      --canal-bg: #0c0c14;
      --canal-surface: #12121e;
      --canal-border: #1a1a2e;
      --canal-text: #e4e4ef;
      --canal-text-muted: #8888a4;
      --canal-radius: 16px;
      --canal-font: system-ui, -apple-system, sans-serif;
      position: fixed;
      z-index: 999999;
      font-family: var(--canal-font);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    :host([position="bottom-right"]), :host(:not([position])) { bottom: 24px; right: 24px; }
    :host([position="bottom-left"]) { bottom: 24px; left: 24px; }
    :host([theme="light"]) {
      --canal-bg: #ffffff; --canal-surface: #f5f5f7;
      --canal-border: #e0e0e4; --canal-text: #1a1a1a; --canal-text-muted: #666;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .fab { width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3); transition: transform 0.2s; }
    .fab:hover { transform: scale(1.08); }
    .fab svg { width: 24px; height: 24px; }
    .fab .ic { display: block; } .fab .ix { display: none; }
    .fab.o .ic { display: none; } .fab.o .ix { display: block; }
    .pnl { display: none; position: absolute; bottom: 72px; right: 0; width: 380px;
      max-width: calc(100vw - 32px); height: 520px; max-height: calc(100vh - 120px);
      background: var(--canal-bg); border: 1px solid var(--canal-border);
      border-radius: var(--canal-radius); overflow: hidden; flex-direction: column;
      box-shadow: 0 16px 64px rgba(0,0,0,0.4); animation: su 0.25s ease-out; }
    :host([position="bottom-left"]) .pnl { right: auto; left: 0; }
    .pnl.o { display: flex; }
    @keyframes su { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .hdr { padding: 16px 20px; display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid var(--canal-border); flex-shrink: 0; }
    .av { width: 36px; height: 36px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .hi { flex: 1; min-width: 0; }
    .hn { font-weight: 600; font-size: 14px; color: var(--canal-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hs { font-size: 11px; color: var(--canal-text-muted); display: flex; align-items: center; gap: 4px; }
    .hs::before { content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: var(--canal-accent); animation: p 2s infinite; }
    @keyframes p { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    .msgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .msgs::-webkit-scrollbar { width: 4px; }
    .msgs::-webkit-scrollbar-thumb { background: var(--canal-border); border-radius: 4px; }
    .m { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px;
      line-height: 1.6; word-wrap: break-word; animation: mi 0.2s ease-out; }
    @keyframes mi { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    .m.b { background: var(--canal-surface); border: 1px solid var(--canal-border);
      color: var(--canal-text); align-self: flex-start; border-bottom-left-radius: 4px; }
    .m.u { align-self: flex-end; border-bottom-right-radius: 4px; color: #000; }
    .m.t { opacity: 0.7; font-style: italic; font-size: 12px; }
    .ia { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--canal-border);
      flex-shrink: 0; background: var(--canal-bg); }
    .inp { flex: 1; background: var(--canal-surface); border: 1px solid var(--canal-border);
      border-radius: 10px; padding: 10px 14px; color: var(--canal-text); font-size: 13px;
      font-family: var(--canal-font); outline: none; transition: border-color 0.2s; }
    .inp:focus { border-color: var(--canal-accent); }
    .inp::placeholder { color: var(--canal-text-muted); }
    .snd { border: none; border-radius: 10px; padding: 10px 14px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; color: #000; flex-shrink: 0; }
    .snd:disabled { opacity: 0.4; cursor: default; }
    .snd svg { width: 18px; height: 18px; }
    .ft { text-align: center; padding: 6px; font-size: 10px; color: var(--canal-text-muted);
      border-top: 1px solid var(--canal-border); flex-shrink: 0; }
    .ft a { color: var(--canal-accent); text-decoration: none; }
    @media (max-width: 420px) {
      .pnl { width: calc(100vw - 16px); height: calc(100vh - 100px); bottom: 68px; right: -16px; }
      :host([position="bottom-left"]) .pnl { left: -16px; }
    }
  \`;

  class CanalChat extends HTMLElement {
    constructor() { super(); this._s = this.attachShadow({mode:'open'}); this._msgs = []; this._str = false;
      this._sid = 'w-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
      this._cfg = { n:'Gabi.OS', w:'Olá! 👋 Como posso ajudar?', c:'#00E5A0' };
    }
    connectedCallback() {
      const sc = document.querySelector('script[data-key][src*="widget"]');
      this._key = this.getAttribute('data-key') || (sc && sc.dataset.key) || '';
      this._base = this.getAttribute('data-base-url') || (sc ? new URL(sc.src).origin : '${baseUrl}');
      this._render(); this._loadCfg();
    }
    async _loadCfg() {
      try { const r = await fetch(this._base+'/api/chatbot-config'); if(r.ok) {
        const d = await r.json(); if(d.bot_name) this._cfg.n=d.bot_name;
        if(d.welcome_message) this._cfg.w=d.welcome_message;
        if(d.theme_color) this._cfg.c=d.theme_color; this._upd(); }
      } catch {}
    }
    _render() {
      const a = this._cfg.c, i = this._cfg.n[0].toUpperCase();
      this._s.innerHTML = '<style>'+WIDGET_CSS+'</style>'+
        '<div class="pnl" id="p"><div class="hdr"><div class="av" id="av" style="background:'+a+';color:#000">'+i+'</div>'+
        '<div class="hi"><div class="hn" id="bn">'+this._cfg.n+'</div><div class="hs">Online</div></div></div>'+
        '<div class="msgs" id="ms"><div class="m b">'+this._cfg.w+'</div></div>'+
        '<div class="ia"><input class="inp" id="i" type="text" placeholder="Digite sua mensagem..." autocomplete="off">'+
        '<button class="snd" id="s" style="background:'+a+'" disabled>'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></button></div>'+
        '<div class="ft">Powered by <a href="'+this._base+'/api/developers" target="_blank">Canal CMS</a></div></div>'+
        '<button class="fab" id="f" style="background:'+a+'" aria-label="Chat">'+
        '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+
        '<svg class="ix" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
      this._bind();
    }
    _upd() {
      const a=this._cfg.c, i=this._cfg.n[0].toUpperCase(),
        av=this._s.getElementById('av'), bn=this._s.getElementById('bn'),
        f=this._s.getElementById('f'), s=this._s.getElementById('s');
      if(av){av.style.background=a;av.textContent=i;} if(bn)bn.textContent=this._cfg.n;
      if(f)f.style.background=a; if(s)s.style.background=a;
    }
    _bind() {
      const f=this._s.getElementById('f'), p=this._s.getElementById('p'),
        inp=this._s.getElementById('i'), s=this._s.getElementById('s');
      f.onclick=()=>{const o=p.classList.toggle('o');f.classList.toggle('o',o);if(o)inp.focus();};
      inp.oninput=()=>{s.disabled=!inp.value.trim()||this._str;};
      inp.onkeydown=(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this._send();}};
      s.onclick=()=>this._send();
    }
    async _send() {
      const inp=this._s.getElementById('i'), t=inp.value.trim();
      if(!t||this._str) return;
      this._msgs.push({role:'user',content:t}); this._addMsg('u',t);
      inp.value=''; this._s.getElementById('s').disabled=true;
      this._str=true; const tEl=this._addMsg('b t','...');
      try {
        const r=await fetch(this._base+'/api/chat',{method:'POST',
          headers:{'Content-Type':'application/json','x-session-id':this._sid},
          body:JSON.stringify({messages:this._msgs})});
        if(!r.ok){tEl.textContent='Erro. Tente novamente.';tEl.classList.remove('t');this._str=false;return;}
        const rd=r.body.getReader(), dc=new TextDecoder(); let ft='';
        tEl.textContent=''; tEl.classList.remove('t');
        while(true){const{done,value}=await rd.read();if(done)break;
          const ch=dc.decode(value,{stream:true});ft+=ch;tEl.textContent=ft;this._scroll();}
        this._msgs.push({role:'assistant',content:ft});
      } catch{tEl.textContent='Erro de conexão.';tEl.classList.remove('t');}
      this._str=false;
    }
    _addMsg(cls,txt) {
      const ms=this._s.getElementById('ms'), d=document.createElement('div');
      d.className='m '+cls; d.textContent=txt;
      if(cls==='u') d.style.background=this._cfg.c;
      ms.appendChild(d); this._scroll(); return d;
    }
    _scroll() {
      const ms=this._s.getElementById('ms');
      requestAnimationFrame(()=>{ms.scrollTop=ms.scrollHeight;});
    }
  }
  if(!customElements.get('canal-chat')) customElements.define('canal-chat',CanalChat);
  requestAnimationFrame(()=>{if(!document.querySelector('canal-chat')){
    const el=document.createElement('canal-chat');document.body.appendChild(el);}});
})();
`

  c.header('Content-Type', 'application/javascript; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=3600')
  c.header('Access-Control-Allow-Origin', '*')
  return c.body(widgetJs)
})
