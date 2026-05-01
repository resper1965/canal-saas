/**
 * Seed script focado em popular APENAS o brandbook via API.
 * Reflete a simplicidade das marcas ness.
 */
import fetch from 'node-fetch'; // if needed, but fetch is global in Node >= 18

const BASE = 'https://canal.ness.com.br/api/v1';

async function seed(collection, data) {
  const res = await fetch(`${BASE}/collections/${collection}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const status = res.status;
  const text = await res.text().catch(() => '');
  const label = data.title || data.name || data.source || '?';
  if (status >= 200 && status < 300) {
    console.log(`  ✓ [${collection}] ${label}`);
  } else {
    console.log(`  ✗ [${collection}] ${label} → ${status}: ${text.slice(0, 100)}`);
  }
}

const brandbook = [
  // CORES
  { title: 'Branco Contraste', slug: 'branco-texto', category: 'cor', brand: 'global', hex_value: '#FFFFFF', desc: 'Cor para texto e logos sobre fundos escuros/surface.', usage_notes: 'Para legibilidade máxima em dark mode.' },
  { title: 'Preto Contraste', slug: 'preto-texto', category: 'cor', brand: 'global', hex_value: '#000000', desc: 'Cor para texto e logos sobre fundos claros.', usage_notes: 'Para legibilidade máxima em temas claros.' },
  { title: 'Azul Ponto', slug: 'azul-ponto', category: 'cor', brand: 'global', hex_value: '#00ade8', desc: 'O azul nativo para o ponto (dot).', usage_notes: 'O ponto deve ter SEMPRE essa cor em todas as marcas e serviços.' },
  { title: 'Dark Surface', slug: 'dark-surface', category: 'cor', brand: 'global', hex_value: '#0b1326', desc: 'Cor de fundo base para as aplicações.', usage_notes: 'Usada no corpo do site.' },
  
  // TIPOGRAFIA
  { title: 'Montserrat Medium 500', slug: 'montserrat-medium', category: 'tipografia', brand: 'global', desc: 'A fonte oficial para composição de MARCAS e logotipos.', usage_notes: 'Usar SEMPRE em caixa baixa (lowercase) para logotipos das marcas e soluções.' },

  // LOGOS E NOMECLATURAS (Composição Visual)
  { title: 'ness.', slug: 'logo-ness', category: 'logo', brand: 'ness', desc: 'Marca Principal', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8. O resto varia entre branco/preto conforme o fundo.' },
  { title: 'trustness.', slug: 'logo-trustness', category: 'logo', brand: 'trustness', desc: 'Marca Ecossistema Trust/Auditoria', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8.' },
  { title: 'forense.io', slug: 'logo-forense', category: 'logo', brand: 'forense', desc: 'Marca Ecossistema Forense Digital', usage_notes: 'Sempre caixa baixa. Ponto entre "forense" e "io" na cor #00ade8.' },

  // SOLUÇÕES / SERVIÇOS
  { title: 'n.secops', slug: 'logo-nsecops', category: 'logo', brand: 'ness', desc: 'Serviço: Resiliência Operacional & Continuidade', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8.' },
  { title: 'n.infraops', slug: 'logo-ninfraops', category: 'logo', brand: 'ness', desc: 'Serviço: Infraestrutura Inteligente & Suporte', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8.' },
  { title: 'n.devarch', slug: 'logo-ndevarch', category: 'logo', brand: 'ness', desc: 'Serviço: Arquitetura Orientada ao Engenheiro', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8.' },
  { title: 'n.autoops', slug: 'logo-nautoops', category: 'logo', brand: 'ness', desc: 'Serviço: Eficiência Operacional & Automação', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8.' },
  { title: 'n.cirt', slug: 'logo-ncirt', category: 'logo', brand: 'ness', desc: 'Serviço: Resposta a Incidentes Críticos', usage_notes: 'Sempre caixa baixa. Ponto na cor #00ade8.' }
];

async function main() {
  console.log('\\n🌱 Inserindo os ativos estritos no Canal CMS Brandbook...\\n');
  
  for (const item of brandbook) {
    await seed('brandbook', item);
  }
  
  console.log('\\n✅ População do brandbook efetuada com sucesso!\\n');
}

main().catch(err => { console.error('❌ Fallhou:', err); process.exit(1); });
