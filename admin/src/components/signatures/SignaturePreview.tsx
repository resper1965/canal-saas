const BRAND_CONFIG: Record<string, { name: string; website: string; websiteDisplay: string }> = {
  ness:      { name: "ness.",      website: "https://ness.com.br",      websiteDisplay: "ness.com.br" },
  trustness: { name: "trustness.", website: "https://trustness.com.br", websiteDisplay: "trustness.com.br" },
  forense:   { name: "forense.io", website: "https://forense.io",        websiteDisplay: "forense.io" },
};

const LOGO_CONFIG: Record<string, { wordmark: string; suffix?: string }> = {
  ness:      { wordmark: "ness" },
  trustness: { wordmark: "trustness" },
  forense:   { wordmark: "forense", suffix: "io" },
};

interface SignaturePreviewProps {
  form: {
    name: string;
    role: string;
    email: string;
    phone: string;
    brand: string;
    linkedin: string;
    disclaimer: boolean;
  };
}

export function SignaturePreview({ form }: SignaturePreviewProps) {
  const brand = BRAND_CONFIG[form.brand] || BRAND_CONFIG.ness;
  const logo  = LOGO_CONFIG[form.brand]  || LOGO_CONFIG.ness;
  const phoneClean = form.phone.replace(/[^0-9+]/g, "");
  const linkedinDisplay = form.linkedin.replace(/^https?:\/\/(www\.)?/, "");

  return (
    <div id="sig-preview">
      <table cellPadding={0} cellSpacing={0} border={0}
        style={{ fontFamily: "Montserrat, Arial, Helvetica, sans-serif", color: "#000000", width: 680, maxWidth: 680 }}>
        <tbody>
          <tr>
            {/* LEFT BLOCK */}
            <td width={285} valign="middle" style={{ padding: "22px 28px 22px 28px" }}>
              <table cellPadding={0} cellSpacing={0} border={0} style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: 22 }}>
                      <a href={brand.website} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: 34, lineHeight: "1", fontWeight: 500, letterSpacing: "-1px", color: "#000000" }}>
                          {logo.wordmark}
                          {logo.suffix && <span style={{ fontWeight: 500 }}>{logo.suffix}</span>}
                          <span style={{ fontWeight: 700, color: "#00ade8" }}>.</span>
                        </div>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: 20 }}>
                      <div style={{ width: 46, height: 3, background: "#00ade8", lineHeight: "3px", fontSize: "3px" }}>&nbsp;</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ fontSize: 22, lineHeight: "1.25", fontWeight: 700, color: "#000000", letterSpacing: "-0.3px" }}>
                        {form.name}
                      </div>
                      <div style={{ fontSize: 15, lineHeight: "1.5", fontWeight: 400, color: "#777777", paddingTop: 3 }}>
                        {form.role}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* DIVIDER */}
            <td width={1} style={{ background: "#dddddd", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</td>

            {/* RIGHT BLOCK */}
            <td valign="middle" style={{ padding: "22px 0 22px 34px" }}>
              <table cellPadding={0} cellSpacing={0} border={0}
                style={{ fontFamily: "Montserrat, Arial, Helvetica, sans-serif", color: "#000000" }}>
                <tbody>
                  <tr>
                    <td width={28} valign="middle" style={{ fontSize: 15, color: "#000000", padding: "0 12px 11px 0" }}>T</td>
                    <td valign="middle" style={{ fontSize: 15, lineHeight: "1.4", color: "#000000", padding: "0 0 11px 0" }}>
                      <a href={`tel:${phoneClean}`} style={{ color: "#000000", textDecoration: "none" }}>{form.phone}</a>
                    </td>
                  </tr>
                  <tr><td colSpan={2} style={{ height: 1, background: "#e6e6e6", lineHeight: "1px", fontSize: "1px" }}>&nbsp;</td></tr>
                  <tr>
                    <td width={28} valign="middle" style={{ fontSize: 15, color: "#000000", padding: "11px 12px 11px 0" }}>E</td>
                    <td valign="middle" style={{ fontSize: 15, lineHeight: "1.4", color: "#000000", padding: "11px 0 11px 0" }}>
                      <a href={`mailto:${form.email}`} style={{ color: "#000000", textDecoration: "none" }}>{form.email}</a>
                    </td>
                  </tr>
                  <tr><td colSpan={2} style={{ height: 1, background: "#e6e6e6", lineHeight: "1px", fontSize: "1px" }}>&nbsp;</td></tr>
                  <tr>
                    <td width={28} valign="middle" style={{ fontSize: 15, color: "#000000", padding: "11px 12px 11px 0" }}>W</td>
                    <td valign="middle" style={{ fontSize: 15, lineHeight: "1.4", color: "#000000", padding: "11px 0 11px 0" }}>
                      <a href={brand.website} style={{ color: "#000000", textDecoration: "none" }}>{brand.websiteDisplay}</a>
                    </td>
                  </tr>
                  <tr><td colSpan={2} style={{ height: 1, background: "#e6e6e6", lineHeight: "1px", fontSize: "1px" }}>&nbsp;</td></tr>
                  <tr>
                    <td width={28} valign="middle" style={{ fontSize: 15, color: "#000000", padding: "11px 12px 0 0" }}>in</td>
                    <td valign="middle" style={{ fontSize: 15, lineHeight: "1.4", color: "#000000", padding: "11px 0 0 0" }}>
                      <a href={form.linkedin} style={{ color: "#000000", textDecoration: "none" }}>{linkedinDisplay}</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* DISCLAIMER */}
          {form.disclaimer && (
            <tr>
              <td colSpan={3} style={{ paddingTop: 14 }}>
                <div style={{ fontSize: 10, lineHeight: "1.45", color: "#999999", borderTop: "1px solid #eeeeee", paddingTop: 10, textAlign: "center" }}>
                  Esta mensagem e seus anexos podem conter informações confidenciais. Caso tenha recebido este e-mail por engano, por favor informe o remetente e exclua a mensagem.
                  <br />
                  This message and its attachments may contain confidential information. If you received this email in error, please notify the sender and delete the message.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export { BRAND_CONFIG, LOGO_CONFIG };
