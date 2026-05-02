import { DEFAULT_TENANT_ID } from '../config'
import { Hono } from 'hono'
import type { Bindings } from '../index'

// Definição dos assets visuais predefinidos (T5.5.1)
// Em um sistema full-production, isso seria puxado do R2/D1 baseados no tenant_id.
const BRAND_CONFIG: Record<string, any> = {
  ness: { 
    name: "ness.",      
    website: "https://ness.com.br",      
    websiteDisplay: "ness.com.br",
    logoWordmark: "ness",
    colors: { primary: "#00ade8", bg: "#ffffff" }
  },
  trustness: { 
    name: "trustness.", 
    website: "https://trustness.com.br", 
    websiteDisplay: "trustness.com.br",
    logoWordmark: "trustness",
    colors: { primary: "#db2777", bg: "#ffffff" }
  },
  forense: { 
    name: "forense.io", 
    website: "https://forense.io",        
    websiteDisplay: "forense.io",
    logoWordmark: "forense",
    logoSuffix: "io",
    colors: { primary: "#10b981", bg: "#0f172a" }
  },
}

export const brandRouter = new Hono<{ Bindings: Bindings, Variables: { tenantId?: string, session?: any } }>()

// T5.5.2 API pública estática para o Brandbook
brandRouter.get('/assets', async (c) => {
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const assets = BRAND_CONFIG[tenantId] || BRAND_CONFIG['ness']
  c.header('Cache-Control', 'public, max-age=300')
  return c.json({ success: true, tenant: tenantId, assets, complete_book: BRAND_CONFIG })
})

// Helper local para injetar HTML da Assinatura
function generateSignatureHTML(form: { name: string, role: string, email: string, phone: string, brand: string, linkedin: string, disclaimer: boolean }) {
  const brand = BRAND_CONFIG[form.brand] || BRAND_CONFIG.ness
  const phoneClean = form.phone.replace(/[^0-9+]/g, "")
  const linkedinDisplay = form.linkedin.replace(/^https?:\/\/(www\.)?/, "")
  
  const logoHTML = brand.logoSuffix 
    ? `${brand.logoWordmark}<span style="font-weight: 500">${brand.logoSuffix}</span><span style="font-weight: 700; color: ${brand.colors.primary}">.</span>`
    : `${brand.logoWordmark}<span style="font-weight: 700; color: ${brand.colors.primary}">.</span>`

  const disclaimerHTML = form.disclaimer ? `
    <tr>
      <td colspan="3" style="padding-top: 14px">
        <div style="font-size: 10px; line-height: 1.45; color: #999999; border-top: 1px solid #eeeeee; padding-top: 10px; text-align: center">
          Esta mensagem e seus anexos podem conter informações confidenciais. Caso tenha recebido este e-mail por engano, por favor informe o remetente e exclua a mensagem.
          <br/>
          This message and its attachments may contain confidential information. If you received this email in error, please notify the sender and delete the message.
        </div>
      </td>
    </tr>
  ` : '';

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family: Montserrat, Arial, Helvetica, sans-serif; color: #000000; width: 680px; max-width: 680px;">
      <tbody>
        <tr>
          <!-- LEFT BLOCK -->
          <td width="285" valign="middle" style="padding: 22px 28px 22px 28px;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td style="padding-bottom: 22px;">
                    <a href="${brand.website}" style="text-decoration: none;">
                      <div style="font-size: 34px; line-height: 1; font-weight: 500; letter-spacing: -1px; color: #000000;">
                        ${logoHTML}
                      </div>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="width: 46px; height: 3px; background: ${brand.colors.primary}; line-height: 3px; font-size: 3px;">&nbsp;</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="font-size: 22px; line-height: 1.25; font-weight: 700; color: #000000; letter-spacing: -0.3px;">
                      ${form.name}
                    </div>
                    <div style="font-size: 15px; line-height: 1.5; font-weight: 400; color: #777777; padding-top: 3px;">
                      ${form.role}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <!-- DIVIDER -->
          <td width="1" style="background: #dddddd; font-size: 1px; line-height: 1px;">&nbsp;</td>

          <!-- RIGHT BLOCK -->
          <td valign="middle" style="padding: 22px 0 22px 34px;">
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: Montserrat, Arial, Helvetica, sans-serif; color: #000000;">
              <tbody>
                <tr>
                  <td width="28" valign="middle" style="font-size: 15px; color: #000000; padding: 0 12px 11px 0;">T</td>
                  <td valign="middle" style="font-size: 15px; line-height: 1.4; color: #000000; padding: 0 0 11px 0;">
                    <a href="tel:${phoneClean}" style="color: #000000; text-decoration: none;">${form.phone}</a>
                  </td>
                </tr>
                <tr><td colspan="2" style="height: 1px; background: #e6e6e6; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
                <tr>
                  <td width="28" valign="middle" style="font-size: 15px; color: #000000; padding: 11px 12px 11px 0;">E</td>
                  <td valign="middle" style="font-size: 15px; line-height: 1.4; color: #000000; padding: 11px 0 11px 0;">
                    <a href="mailto:${form.email}" style="color: #000000; text-decoration: none;">${form.email}</a>
                  </td>
                </tr>
                <tr><td colspan="2" style="height: 1px; background: #e6e6e6; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
                <tr>
                  <td width="28" valign="middle" style="font-size: 15px; color: #000000; padding: 11px 12px 11px 0;">W</td>
                  <td valign="middle" style="font-size: 15px; line-height: 1.4; color: #000000; padding: 11px 0 11px 0;">
                    <a href="${brand.website}" style="color: #000000; text-decoration: none;">${brand.websiteDisplay}</a>
                  </td>
                </tr>
                <tr><td colspan="2" style="height: 1px; background: #e6e6e6; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
                <tr>
                  <td width="28" valign="middle" style="font-size: 15px; color: #000000; padding: 11px 12px 0 0;">in</td>
                  <td valign="middle" style="font-size: 15px; line-height: 1.4; color: #000000; padding: 11px 0 0 0;">
                    <a href="${form.linkedin}" style="color: #000000; text-decoration: none;">${linkedinDisplay}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        ${disclaimerHTML}
      </tbody>
    </table>
  `
}

// T5.5.4 e T5.5.5 Self-serve autenticado
brandRouter.get('/signature/me', async (c) => {
  const session = c.get('session')
  const user = session?.user
  
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  // Customização condicional via Auth Meta ou fallback para default
  const defaultBrand = c.get('tenantId') || DEFAULT_TENANT_ID
  
  const form = {
    name: user.name || "Colaborador",
    role: "Membro da Equipe",
    email: user.email,
    phone: "+55 11 00000-0000",
    brand: defaultBrand,
    linkedin: "https://www.linkedin.com/company/" + defaultBrand,
    disclaimer: true
  }

  // Permitir overriding via querystring (caso a UI passe os dados editados pra download)
  const queryOverrides = c.req.query()
  const finalForm = {
    name: queryOverrides.name || form.name,
    role: queryOverrides.role || form.role,
    email: queryOverrides.email || form.email,
    phone: queryOverrides.phone || form.phone,
    brand: queryOverrides.brand || form.brand,
    linkedin: queryOverrides.linkedin || form.linkedin,
    disclaimer: queryOverrides.disclaimer !== 'false'
  }

  const htmlContent = generateSignatureHTML(finalForm)

  const responseType = c.req.query('type') || 'html' // Manda JSON por default a não ser que peça template 'file'
  
  if (responseType === 'file') {
    return new Response(htmlContent, {
      headers: {
         'Content-Type': 'text/html',
         'Content-Disposition': `attachment; filename="assinatura_${finalForm.name.replace(/ /g, '_')}.html"`
      }
    })
  }
  
  return c.json({ success: true, base_form: finalForm, html: htmlContent })
})
