import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const DB_FLAGS = 'canal-db --remote';

console.log('Criando SQL de deduplicação e correção do post...');

const goodBodyPrivacy = `## O Paradigma Inevitável: Privacy by Design

No cenário conturbado e altamente conectado da economia digital de 2026, a pergunta deixou de ser se a sua corporação priorizará privacidade, para tornar-se **quando** e **como** ela o fará de forma nativa. 

Privacidade adicionada depois do lançamento de um produto custa, em média, 10 vezes mais para ser corrigida e causa fricção enorme para os usuários finais. A *Lei Geral de Proteção de Dados (LGPD)*, por meio de regulações mais recentes e estritas (como as definições em torno do Art. 46), torna o **Privacy by Design** não apenas uma boa prática competitiva, mas um requisito estrito e legal.

### Privacidade no Nível das Squads

O grande desafio não está no departamento jurídico, mas nas linhas de montagem de software e de novos serviços corporativos:
- **Privacy Impact Assessment (PIA):** Uma avaliação ágil aplicada *antes* de qualquer kickoff de projeto.
- **Cartão de Privacidade (User Story):** Inclusão mandatório nos critérios de aceite ("Definition of Done"). Toda feature nasce com rastreabilidade de dados.

Na Trustness, a metodologia de implementação garante que em apenas 3 meses as equipes internas assimilem o processo de Privacy by Design, eliminando gargalos, consultas lentas e permitindo que a inovação aconteça protegendo, ativamente, os clientes finais.`;

const goodBodyPrivacyEscaped = goodBodyPrivacy.replace(/'/g, "''");

const sql = `
-- 1. Deduplicar entradas
DELETE FROM entries WHERE id NOT IN (
  SELECT min(id) FROM entries GROUP BY collection_id, slug, locale
);

-- 2. Reescrever body zoado de Privacy By Design
UPDATE entries 
SET data = json_set(data, '$.body', '${goodBodyPrivacyEscaped}')
WHERE slug = 'privacy-by-design-lgpd';
`;

writeFileSync('/tmp/_fix.sql', sql, 'utf8');

console.log('Executando migração no DB...');
try {
  execSync(`npx wrangler d1 execute ${DB_FLAGS} --file=/tmp/_fix.sql`, { stdio: 'inherit' });
  console.log('✅ Corrigido!');
} catch (e) {
  console.error('❌ Erro:', e.message);
} finally {
  unlinkSync('/tmp/_fix.sql');
}
