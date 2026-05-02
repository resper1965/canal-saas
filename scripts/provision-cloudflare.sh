#!/bin/bash
# Canal SaaS — Cloudflare Resource Provisioning Script
#
# Provisiona todos os recursos necessários para rodar em produção.
# Executar: bash scripts/provision-cloudflare.sh
#
# Pré-requisitos:
#   - wrangler autenticado (npx wrangler login)
#   - Node.js 18+
#
# O script vai:
#   1. Criar D1 database
#   2. Criar KV namespace
#   3. Criar R2 bucket
#   4. Criar Queue
#   5. Criar Vectorize index
#   6. Atualizar wrangler.jsonc com os IDs reais

set -e

echo "🚀 Canal SaaS — Provisionamento Cloudflare"
echo "============================================"
echo ""

PROJECT_NAME="canal-saas"
WRANGLER="npx wrangler"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── 1. D1 Database ──────────────────────────────────────────────
echo -e "${YELLOW}📦 Criando D1 database...${NC}"
D1_OUTPUT=$($WRANGLER d1 create "${PROJECT_NAME}-db" 2>&1 || true)
D1_ID=$(echo "$D1_OUTPUT" | grep -oP '"database_id":\s*"\K[^"]+' || echo "")

if [ -z "$D1_ID" ]; then
  D1_ID=$(echo "$D1_OUTPUT" | grep -oP 'database_id\s*=\s*"\K[^"]+' || echo "")
fi

if [ -z "$D1_ID" ]; then
  echo "⚠️  D1 já existe ou erro. Verifique com: $WRANGLER d1 list"
  echo "   Output: $D1_OUTPUT"
else
  echo -e "${GREEN}✅ D1 criado: $D1_ID${NC}"
fi

# ── 2. KV Namespace ─────────────────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Criando KV namespace...${NC}"
KV_OUTPUT=$($WRANGLER kv namespace create "CANAL_KV" 2>&1 || true)
KV_ID=$(echo "$KV_OUTPUT" | grep -oP '"id":\s*"\K[^"]+' | head -1 || echo "")

if [ -z "$KV_ID" ]; then
  KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id\s*=\s*"\K[^"]+' | head -1 || echo "")
fi

if [ -z "$KV_ID" ]; then
  echo "⚠️  KV já existe ou erro. Verifique com: $WRANGLER kv namespace list"
else
  echo -e "${GREEN}✅ KV criado: $KV_ID${NC}"
fi

# ── 3. R2 Bucket ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Criando R2 bucket...${NC}"
$WRANGLER r2 bucket create "${PROJECT_NAME}-media" 2>&1 || echo "⚠️  R2 bucket já existe"
echo -e "${GREEN}✅ R2 bucket: ${PROJECT_NAME}-media${NC}"

# ── 4. Queue ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Criando Queue...${NC}"
$WRANGLER queues create "${PROJECT_NAME}-queue" 2>&1 || echo "⚠️  Queue já existe"
echo -e "${GREEN}✅ Queue: ${PROJECT_NAME}-queue${NC}"

# ── 5. Vectorize Index ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Criando Vectorize index...${NC}"
$WRANGLER vectorize create "${PROJECT_NAME}-vectors" \
  --dimensions 768 \
  --metric cosine 2>&1 || echo "⚠️  Vectorize index já existe"
echo -e "${GREEN}✅ Vectorize: ${PROJECT_NAME}-vectors${NC}"

# ── 6. Summary ──────────────────────────────────────────────────
echo ""
echo "============================================"
echo -e "${GREEN}✅ Provisionamento concluído!${NC}"
echo ""
echo "Atualize manualmente o wrangler.jsonc com os IDs:"
echo ""
if [ -n "$D1_ID" ]; then
  echo "  D1 database_id: $D1_ID"
fi
if [ -n "$KV_ID" ]; then
  echo "  KV id: $KV_ID"
fi
echo ""
echo "Depois, rode as migrations:"
echo "  npx wrangler d1 migrations apply ${PROJECT_NAME}-db --remote"
echo ""
echo "E faça o deploy:"
echo "  npx wrangler deploy"
echo ""
echo "Domínio de produção: canal.bekaa.eu"
echo ""
