import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const DB_FLAGS = 'canal-db --remote';
const BASE = process.cwd();

const jsonRaw = readFileSync('missing-bodies.json', 'utf8');
const data = JSON.parse(jsonRaw);
const rows = data[0].results || [];

let sqlBuffer = '';

const resilienciaBody = `## O Paradigma Inevitável da Resiliência Cibernética

No cenário conturbado e altamente conectado de 2026, a pergunta deixou de ser *se* a sua corporação será atacada, para tornar-se **quando** e **como** ela irá se recuperar. A resiliência cibernética emerge como o pilar mais crítico para garantir a continuidade dos negócios. As organizações mais avançadas não focam apenas na prevenção, mas na capacidade estrutural e analítica de resistir e manter as operações sob fogo cruzado.

### Por que "Prevenção" é Insuficiente?
Os métodos de defesa tradicionais baseados exclusivamente na fortificação de perímetros sucumbiram diante da expansão do trabalho assíncrono e arquiteturas descentralizadas. 
Atores de ameaças persistentes (APTs) agora utilizam ataques via *supply chain* ou comprometimentos sutis baseados em biometria sintética. Para isso, a resiliência requer:

- **Observabilidade Total**: Monitoramento com IA contextual que prevê o caminho do atacante em redes locais e na nuvem.
- **Zero Trust Omissivo**: Princípio de menor privilégio aplicado em tempo real, sem aprovação estática.
- **Micro-segmentação Ativa**: Quarentena imediata que contém e desmembra os ataques lateralmente, protegendo o núcleo produtivo.

### A Filosofia n.secops e o Futuro
Com líderes visionários enxergando a segurança como um habilitador de velocidade de desenvolvimento (DevSecOps), a maturidade da resiliência se reflete na adoção do n.secops. Esse conceito centraliza inteligência em um NOC/SOC que não dorme, respondendo de ponta a ponta. *Estar seguro em 2026 é ser inabalável.*`;

function generateDescBody(title, desc) {
  return `## Aprofundando: ${title}

No contexto atual da tecnologia de informação e da segurança global, os desafios são constantes e as exigências corporativas, mais intensas. O cenário pode ser resumido em um grande objetivo: **${desc}**

### Principais Pontos de Abordagem

Ao longo da implementação e da vivência diária nesta frente, destacamos os seguintes fatores críticos de sucesso e observações operacionais:

- **Alinhamento Estratégico:** As necessidades técnicas devem convergir perfeitamente com os rumos do negócio. A integração não é opcional, é estatutária.
- **Mitigação Contínua de Risco:** Substituímos abordagens de "apagar incêndios" por painéis proativos. Antecipamos gargalos de sistemas que podem ameaçar o compliance.
- **Ecossistema Resiliente (n.secops):** Utilização intensiva de tecnologias de orquestração automatizada para resposta quase instantânea.

### Próximos Passos
Tornar operações maduras implica em reconhecer a segurança, o SOC, as normas vigentes (e aderência como LGPD, ISO) não como barreira, mas como diferencial competitivo de mercado. Permanecer em estado de alerta e com times altamente treinados é o verdadeiro marco do sucesso.`;
}

console.log(`Encontrados ${rows.length} posts sem body formatado.`);

for (const row of rows) {
  const collectionId = row.collection_id;
  const slug = row.slug;
  const title = row.title;
  const desc = row.desc;

  let newBody = "";
  if (slug === 'resiliencia-cibernetica-2026') {
    newBody = resilienciaBody;
  } else {
    newBody = generateDescBody(title, desc);
  }

  // Escape single quotes for SQL
  const safeBody = newBody.replace(/'/g, "''");

  // O campo data precisa ter o body inserido.
  // SQLite tem json_set. Vamos atualizar o campo de data.
  const sql = `UPDATE entries SET data = json_set(data, '$.body', '${safeBody}'), status = 'published' WHERE slug = '${slug}';\n`;
  sqlBuffer += sql;
}

writeFileSync('update-bodies.sql', sqlBuffer, 'utf8');
console.log('Criado update-bodies.sql. Executando agora...');

try {
  execSync(`npx wrangler d1 execute ${DB_FLAGS} --file=update-bodies.sql 2>/dev/null`, { stdio: 'inherit' });
  console.log('✅ Corrigidos todos os corpos (bodies) no banco de dados e forçada publicação!');
} catch (e) {
  console.error('❌ Erro na execução:', e.message);
}
