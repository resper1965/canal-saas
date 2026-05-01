interface LogoCardProps {
  logo: Record<string, any>;
}

function downloadUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function generateSVG(title: string, mode: 'light' | 'dark') {
  const parts = title.split('.');
  const width = title.length * 15 + 10;
  const textColor = mode === 'light' ? '#0f172a' : '#ffffff';

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 32" width="${width}" height="32">`;
  svg += `<style>@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap'); text { font-family: 'Montserrat', Arial, sans-serif; }</style>`;

  if (parts.length === 1) {
    svg += `<text x="0" y="26" font-size="26" font-weight="500" letter-spacing="-0.03em" fill="${textColor}">${parts[0]}</text>`;
  } else {
    const p0Width = parts[0].length * 15;
    svg += `<text x="0" y="26" font-size="26" font-weight="500" letter-spacing="-0.03em" fill="${textColor}">${parts[0]}</text>`;
    svg += `<text x="${p0Width}" y="26" font-size="26" font-weight="500" letter-spacing="-0.03em" fill="#00ade8">.</text>`;
    if (parts[1]) {
      svg += `<text x="${p0Width + 9}" y="26" font-size="26" font-weight="500" letter-spacing="-0.03em" fill="${textColor}">${parts[1]}</text>`;
    }
  }
  svg += `</svg>`;
  return svg;
}

function generatePNG(title: string, mode: 'light' | 'dark') {
  const parts = title.split('.');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scale = 4;
  canvas.width = (title.length * 15 + 20) * scale;
  canvas.height = 40 * scale;

  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '500 26px Montserrat, Arial, sans-serif';
  ctx.textBaseline = 'top';

  const textColor = mode === 'light' ? '#0f172a' : '#ffffff';
  let currentX = 0;

  ctx.fillStyle = textColor;
  ctx.fillText(parts[0], currentX, 4);
  currentX += ctx.measureText(parts[0]).width - 2;

  if (parts.length > 1) {
    ctx.fillStyle = '#00ade8';
    ctx.fillText('.', currentX, 4);
    currentX += ctx.measureText('.').width - 2;
    if (parts[1]) {
      ctx.fillStyle = textColor;
      ctx.fillText(parts[1], currentX, 4);
    }
  }

  return canvas.toDataURL('image/png');
}

function LogoPreview({ parts, mode }: { parts: string[]; mode: 'light' | 'dark'; previewUrl?: string }) {
  const isLight = mode === 'light';
  return (
    <div className={`h-20 flex items-center justify-center rounded-lg border relative overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#060e20] border-slate-800'}`}>
      <div className={`absolute top-1.5 left-2 text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
        {isLight ? 'Light' : 'Dark'}
      </div>
      <span className="font-medium font-sans text-xl sm:text-2xl tracking-tighter" style={{ fontFamily: 'Montserrat, sans-serif', color: isLight ? '#0f172a' : '#ffffff' }}>
        {parts.map((part: string, i: number, arr: string[]) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && <span className="text-cyan-500">.</span>}
          </span>
        ))}
      </span>
    </div>
  );
}

export function LogoCard({ logo }: LogoCardProps) {
  const isSynthetic = !logo.preview_url;
  const parts = logo.title.split('.');

  const handleDownloadSVG = (mode: 'light' | 'dark') => {
    const svg = generateSVG(logo.title, mode);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadUrl(URL.createObjectURL(blob), `${logo.title.replace('.', '')}-logo-${mode}-transparent.svg`);
  };

  const handleDownloadPNG = (mode: 'light' | 'dark') => {
    const url = generatePNG(logo.title, mode);
    if (url) downloadUrl(url, `${logo.title.replace('.', '')}-logo-${mode}-transparent.png`);
  };

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-background p-4 shadow-sm relative group overflow-hidden">
      <div className="flex flex-col gap-3">
        {logo.preview_url ? (
          <>
            <div className="h-20 bg-white flex items-center justify-center rounded-lg border border-slate-200 relative overflow-hidden">
              <div className="absolute top-1.5 left-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Light</div>
              <img src={logo.preview_url} alt={logo.title} className="max-w-[80%] max-h-10 object-contain" />
            </div>
            <div className="h-20 bg-[#060e20] flex items-center justify-center rounded-lg border border-slate-800 relative overflow-hidden">
              <div className="absolute top-1.5 left-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">Dark</div>
              <img src={logo.preview_url} alt={logo.title} className="max-w-[80%] max-h-10 object-contain" />
            </div>
          </>
        ) : (
          <>
            <LogoPreview parts={parts} mode="light" />
            <LogoPreview parts={parts} mode="dark" />
          </>
        )}
      </div>

      <div className="font-bold text-base tracking-tight text-foreground mt-5">{logo.title}</div>
      <div className="text-xs font-semibold uppercase text-muted-foreground mt-0.5">{logo.brand}</div>

      {isSynthetic ? (
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/40">
          <div className="flex justify-center gap-2">
            <button onClick={() => handleDownloadPNG('light')} className="flex-1 inline-flex items-center justify-center rounded text-[10px] sm:text-xs font-bold h-7 sm:h-8 bg-black text-white hover:bg-black/80 transition-colors shadow-sm" title="Baixar PNG Claro">
              PNG CLARO
            </button>
            <button onClick={() => handleDownloadSVG('light')} className="flex-1 inline-flex items-center justify-center rounded text-[10px] sm:text-xs font-bold h-7 sm:h-8 border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors" title="Baixar SVG Claro">
              SVG CLARO
            </button>
          </div>
          <div className="flex justify-center gap-2">
            <button onClick={() => handleDownloadPNG('dark')} className="flex-1 inline-flex items-center justify-center rounded text-[10px] sm:text-xs font-bold h-7 sm:h-8 bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-sm" title="Baixar PNG Escuro">
              PNG ESCURO
            </button>
            <button onClick={() => handleDownloadSVG('dark')} className="flex-1 inline-flex items-center justify-center rounded text-[10px] sm:text-xs font-bold h-7 sm:h-8 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors" title="Baixar SVG Escuro">
              SVG ESCURO
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-4 pt-4 border-t border-border/40">
          <button onClick={() => navigator.clipboard.writeText(logo.title)} className="w-full inline-flex items-center justify-center rounded-md text-xs font-semibold h-8 border border-input shadow-sm bg-background hover:bg-accent hover:text-accent-foreground transition-all" title="Copiar nome">
            Copiar Referência
          </button>
        </div>
      )}
    </div>
  );
}
