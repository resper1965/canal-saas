import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const DB_FLAGS = 'canal-db --remote';

const sql = `
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/zero_trust.png') WHERE slug IN ('banco-digital-zero-trust', 'ecommerce-pci-dss-40');
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/health.png') WHERE slug IN ('hospital-lgpd-dados-saude', 'operadora-saude-apt');
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/ransomware.png') WHERE slug = 'fintech-contencao-ransomware';
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/devsecops.png') WHERE slug IN ('saas-b2b-devsecops', 'fintech-credito-dora', 'industria-iso27001-greenfield');
`;

writeFileSync('/tmp/_update_images.sql', sql, 'utf8');

console.log('Atualizando imagens no DB...');
try {
  execSync(`npx wrangler d1 execute ${DB_FLAGS} --file=/tmp/_update_images.sql`, { stdio: 'inherit' });
  console.log('✅ Imagens atualizadas!');
} catch (e) {
  console.error('❌ Erro:', e.message);
} finally {
  unlinkSync('/tmp/_update_images.sql');
}
