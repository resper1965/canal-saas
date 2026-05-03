import { DurableObject } from "cloudflare:workers";
import { streamText, generateText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { z } from "zod";
import { Bindings } from "./index"; // ou você pode extrair type Bindings para types.ts

export class GabiAgent extends DurableObject<Bindings> {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { messages, locale, ragContext, clientIp } = await request.json() as {
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      locale?: string;
      ragContext?: string;
      clientIp?: string;
    };

    const lang = locale === 'en' ? 'English' : locale === 'es' ? 'Spanish' : 'Portuguese';

    // Read AI config from KV (set via admin panel)
    let aiConfig: { enabled?: boolean; tone?: string; customPrompt?: string } = {};
    try {
      const raw = await this.env.CANAL_KV.get('ai-config');
      if (raw) aiConfig = JSON.parse(raw);
    } catch { /* fallback to defaults */ }

    // If chatbot is disabled via admin panel, return 503
    if (aiConfig.enabled === false) {
      return new Response(JSON.stringify({ error: 'Chatbot desativado' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    // Salvar no estado da D.O. para histórico
    await this.ctx.storage.put("latest_interaction", Date.now());

    // Tone modifiers
    const TONE_MOD: Record<string, string> = {
      executivo: 'Elegante, discreta, de extrema confiança e DIRETA. Levemente sarcástica e bem-humorada.',
      formal: 'Formal, institucional e polida. Tom corporativo sem informalidade.',
      tecnico: 'Precisa, técnica e detalhada. Foco em dados e termos exatos.',
      casual: 'Acessível, leve e descontraída. Linguagem simples e amigável.',
    };
    const toneDesc = TONE_MOD[aiConfig.tone || 'executivo'] || TONE_MOD.executivo;

    const defaultPrompt = `Você é a Gabi, Secretária Executiva e concierge de alto nível da ness.

[SUA PERSONALIDADE]
${toneDesc}
Responda sempre em no máximo 2-3 frases curtas. Sem bullet points, sem listas, sem dissertações.

[SEU CONHECIMENTO]
Você conhece bem o ecossistema:
- ness. (serviços corporativos e tecnologia, fundada em 1991)
- trustness. (compliance, privacidade, LGPD e governança)
- forense.io / n.cirt (cibersegurança e resposta a incidentes)

[SUA REGRA DE OURO — NUNCA QUEBRE ISSO]
Você é INTELIGENTE, mas NÃO é consultora gratuita.
- Demonstre domínio do assunto com 1 frase precisa.
- Na frase seguinte, redirecione: proponha que o time especialista aprofunde o tema.
- Peça o contato do usuário (e-mail ou telefone) de forma natural para que alguém da equipe retorne.
- NUNCA explique processos inteiros, nunca liste etapas técnicas, nunca faça diagnósticos completos.

Exemplos do que FAZER:
"LGPD tem nuances que variam bastante por setor. Para não generalizar, posso pedir que um dos nossos especialistas te explique como isso se aplica à sua empresa. Me passa um e-mail?"
"Resposta a incidentes tem um protocolo próprio — melhor o time do n.cirt avaliar sua situação diretamente. Qual o melhor contato?"

Exemplos do que NÃO FAZER:
Nunca responda algo como "Para adequação LGPD, os passos são: 1) mapeamento de dados, 2) avaliação de riscos, 3)..." — esse nível de detalhe é papel do time, não seu.

IMPORTANTE: O idioma configurado é ${lang}. Responda SEMPRE em ${lang}.

[INCIDENTES CRÍTICOS — SLA-0]
Se o usuário estiver sofrendo um ataque AGORA (ransomware, vazamento, sistema fora do ar):
- Desative o sarcasmo completamente.
- Oriente-o a clicar no botão vermelho "Reportar Incidente" na tela imediatamente.
- Pergunte somente o escopo do impacto.

Fora do escopo (esportes, política, receitas): encerre com elegância e ironia leve.

--- CONTEXTO DOS SERVIÇOS ---
${ragContext}
--- FIM ---`;

    // Use custom prompt if set via admin panel, otherwise use default
    const systemPrompt = aiConfig.customPrompt?.trim()
      ? aiConfig.customPrompt.replace('${lang}', lang).replace('${ragContext}', ragContext || '')
      : defaultPrompt;

    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      system: systemPrompt,
      messages: messages,
    });

    const backgroundTask = async () => {
      try {
        // ALWAYS persist chat session for admin visibility (Relational Schema)
        const sessionId = request.headers.get("x-session-id") || `gabi-${Date.now()}`;
        // Multi-tenant: resolve from DO name or header
        const tenantId = request.headers.get("x-tenant-id") || 'public';
        
        // 1. Upsert session summary
        await this.env.DB.prepare(
          "INSERT INTO chat_sessions (id, tenant_id, locale, turn_count, created_at, status) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'active') ON CONFLICT(id) DO UPDATE SET turn_count = excluded.turn_count, ended_at = CURRENT_TIMESTAMP"
        ).bind(sessionId, tenantId, locale || 'pt', messages.length).run();

        // 2. Sync full message context (Naive re-insert for exact sequence state)
        await this.env.DB.prepare("DELETE FROM chat_messages WHERE session_id = ?").bind(sessionId).run();
        
        // Using batch for better DO performance
        const batchStmts = messages.map((m: { role: string; content: string }) => 
          this.env.DB.prepare(
            "INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
          ).bind(sessionId, m.role, String(m.content))
        );
        await this.env.DB.batch(batchStmts);

        console.log("[BG CHAT RELATIONAL SAVED]", sessionId);

        // Lead extraction — only when user provides contact info
        const lastMsg = messages[messages.length - 1]?.content || "";
        const hasPhone = /(\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})/.test(lastMsg);
        if (lastMsg.includes("@") || hasPhone || lastMsg.toLowerCase().includes("contato")) {
          const extractionPrompt = `Analise a seguinte conversa recente. O usuário forneceu seus dados de contato (email, telefone)? 
Se sim, retorne APENAS um objeto JSON válido com as chaves: "name", "contact" (o email ou telefone fornecido), "intent" (o que ele quer) e "urgency" ("baixa", "media", ou "alta").
Exemplo: {"name":"João","contact":"joao@email.com","intent":"Dúvida LGPD","urgency":"alta"}
NÃO retorne texto adicional nem decorações markdown. Se não houver dados claros, retorne exatamente a palavra NULL.`;

          const _workersai = createWorkersAI({ binding: this.env.AI });
          const extraction = await generateText({
            model: _workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
            system: extractionPrompt,
            messages: messages.slice(-4),
          });

          const text = extraction.text.trim().replace(/^\\s*```json\\n?|```\\s*$/g, '');
          if (text !== "NULL" && text.startsWith("{")) {
            const data = JSON.parse(text);
            if (data.name && data.contact) {
              await this.env.DB.prepare(
                "INSERT INTO leads (name, contact, source, intent, urgency, tenant_id) VALUES (?, ?, 'chatbot', ?, ?, 'org-global-01')"
              ).bind(data.name, data.contact, data.intent || "Contato", data.urgency || "media").run();
              console.log("[BG LEAD CAPTURED]", data);

              // Notifica o time comercial via Resend
              if (this.env.RESEND_API_KEY) {
                const chatlog = messages.map((m: { role: string; content: string }) => {
                  const role = m.role === "user" ? "👤 Usuário" : "🤖 Gabi";
                  return `<tr><td style="padding:6px 10px;vertical-align:top;color:#888;white-space:nowrap;font-size:12px;">${role}</td><td style="padding:6px 10px;font-size:13px;color:#222;">${String(m.content).replace(/</g, "&lt;")}</td></tr>`;
                }).join("");

                await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${this.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    from: "Gabi <gabi@canal.bekaa.eu>",
                    to: ["comercial@ness.com.br"],
                    subject: `[Gabi] Novo lead: ${data.name} — ${data.intent || "Contato"}`,
                    html: `
                      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                        <h2 style="color:#111;margin-bottom:4px;">🎯 Novo lead qualificado</h2>
                        <p style="color:#888;font-size:12px;margin-top:0;">Capturado pela Gabi · ness. AI</p>

                        <table cellpadding="10" style="border-collapse:collapse;width:100%;background:#f5f5f5;border-radius:8px;margin-bottom:24px;">
                          <tr><td><strong>Nome</strong></td><td>${data.name}</td></tr>
                          <tr><td><strong>Contato</strong></td><td><a href="mailto:${data.contact}">${data.contact}</a></td></tr>
                          <tr><td><strong>Intenção</strong></td><td>${data.intent || "-"}</td></tr>
                          <tr><td><strong>Urgência</strong></td><td style="text-transform:capitalize;font-weight:bold;color:${data.urgency === 'alta' ? '#c00' : data.urgency === 'media' ? '#e67e00' : '#2a2'};">${data.urgency || "media"}</td></tr>
                        </table>

                        <h3 style="color:#333;border-bottom:1px solid #ddd;padding-bottom:8px;">💬 Transcrição da conversa</h3>
                        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-radius:8px;overflow:hidden;">
                          ${chatlog}
                        </table>

                        <p style="color:#aaa;font-size:11px;margin-top:24px;">canal.bekaa.eu · ${new Date().toLocaleString("pt-BR")}</p>
                      </div>
                    `,
                  }),
                });
                console.log("[BG EMAIL SENT] →", data.contact);
              }
            }
          }
        }
      } catch (err) {
        console.error("[BG Error]", err);
      }
    };
    
    this.ctx.waitUntil(backgroundTask());

    return result.toTextStreamResponse() as unknown as Response;
  }
}
