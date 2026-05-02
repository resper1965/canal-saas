/**
 * Canal CMS — Email Service
 *
 * Prioridade de envio:
 *   1. Cloudflare Email Service (env.EMAIL.send) — novo, beta pública, API JSON direta
 *   2. Cloudflare Email Routing (env.SEND_EMAIL) — legacy, requer mimetext + MIME raw
 *   3. Log to console (fallback dev)
 *
 * O Email Service é o substituto nativo do Resend/SendGrid.
 * Não requer API keys, não conflita com Google Workspace.
 */

const DEFAULT_SENDER = { name: "Canal Platform", email: "noreply@canal.bekaa.eu" };

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: { name: string; email: string };
}

export async function sendEmail(
  env: { EMAIL?: any; SEND_EMAIL?: any },
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text, from = DEFAULT_SENDER } = options;

  // ── Strategy 1: Cloudflare Email Service (new API) ─────────
  if (env.EMAIL?.send) {
    try {
      await env.EMAIL.send({
        from: `${from.name} <${from.email}>`,
        to,
        subject,
        html,
        ...(text ? { text } : {}),
      });
      return { success: true };
    } catch (e: unknown) {
      // console.error("[email:EMAIL] Failed:", e.message);
      // Fall through to legacy
    }
  }

  // ── Strategy 2: Email Routing send_email (legacy) ──────────
  if (env.SEND_EMAIL?.send) {
    try {
      const { EmailMessage } = await import("cloudflare:email");
      const { createMimeMessage } = await import("mimetext");

      const msg = createMimeMessage();
      msg.setSender({ name: from.name, addr: from.email });
      msg.setRecipient(to);
      msg.setSubject(subject);
      msg.addMessage({ contentType: "text/html", data: html });
      if (text) msg.addMessage({ contentType: "text/plain", data: text });

      const message = new EmailMessage(from.email, to, msg.asRaw());
      await env.SEND_EMAIL.send(message);
      return { success: true };
    } catch (e: unknown) {
      // console.error("[email:SEND_EMAIL] Failed:", e.message);
    }
  }

  // ── Fallback: log only ─────────────────────────────────────
  // console.log(`[email:noop] Would send to=${to} subject="${subject}"`);
  return { success: false, error: "No email binding available" };
}

// ── Email Templates ────────────────────────────────────────────

export function welcomeEmail(userName: string): { subject: string; html: string; text: string } {
  return {
    subject: "Bem-vindo ao Canal Platform",
    text: `Olá ${userName}, sua conta no Canal Platform foi criada com sucesso.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h2 style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;margin:0;">Canal Platform</h2>
      <div style="width:40px;height:3px;background:#00ade8;margin:12px auto 0;border-radius:2px;"></div>
    </div>
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:40px 32px;">
      <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px;">Bem-vindo, ${userName}!</h1>
      <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Sua conta foi criada com sucesso. Você já pode acessar o painel de governança e gestão de dados.
      </p>
      <a href="https://canal.bekaa.eu" style="display:inline-block;background:#00ade8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
        Acessar Plataforma
      </a>
    </div>
    <p style="color:#444;font-size:11px;text-align:center;margin-top:32px;">
      © 2026 Canal Platform · Infraestrutura Zero-Trust
    </p>
  </div>
</body>
</html>`,
  };
}

export function inviteEmail(orgName: string, inviterName: string): { subject: string; html: string; text: string } {
  return {
    subject: `Convite para ${orgName} no Canal Platform`,
    text: `${inviterName} convidou você para a organização ${orgName} no Canal Platform.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h2 style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;margin:0;">Canal Platform</h2>
      <div style="width:40px;height:3px;background:#00ade8;margin:12px auto 0;border-radius:2px;"></div>
    </div>
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:40px 32px;">
      <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px;">Você foi convidado!</h1>
      <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 8px;">
        <strong style="color:#fff;">${inviterName}</strong> convidou você para a organização:
      </p>
      <div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:16px 20px;margin:16px 0 24px;">
        <span style="color:#00ade8;font-size:16px;font-weight:700;">${orgName}</span>
      </div>
      <a href="https://canal.bekaa.eu" style="display:inline-block;background:#00ade8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
        Aceitar Convite
      </a>
    </div>
    <p style="color:#444;font-size:11px;text-align:center;margin-top:32px;">
      © 2026 Canal Platform · Infraestrutura Zero-Trust
    </p>
  </div>
</body>
</html>`,
  };
}
