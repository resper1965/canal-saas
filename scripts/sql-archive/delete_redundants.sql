-- Limpeza de Duplicidades e Artigos Generalistas Legados (Batch 1 -> Batch 2)

-- 1. Casos de Uso Redundantes (col-cases)
DELETE FROM entries 
WHERE slug IN (
    'grupo-industrial-global',              -- Sobreposto por fintech-contencao-ransomware
    'privacidade-lgpd-comercial-esperanca', -- Sobreposto por hospital-lgpd-dados-saude
    'fintech-credito-dora',                 -- Sobreposto por saas-b2b-devsecops
    'gestao-e-atendimento-cavan'            -- Sobreposto pelos cases modernos de n.infraops/n.secops
);

-- 2. Artigos de Blog (col-insights) Genéricos / Redundantes
DELETE FROM entries 
WHERE slug IN (
    'ztna-e-o-fim-das-vpns',                -- Retido: zero-trust-na-pratica-secops (muito mais denso)
    'modelos-agenticos-no-suporte',         -- Retido: gabi-em-acao-automa-360-no-itsm
    'ia-generativa-operacoes-criticas',     -- Retido: gabi-em-acao-automa-360-no-itsm
    'privacidade-como-diferencial',         -- Retido: lgpd-anpd-2026-novas-sancoes e privacy-by-design-lgpd
    'cultura-de-compliance-certificacoes',  -- Retido: lgpd-anpd-2026-novas-sancoes
    'resiliencia-cibernetica-2026',         -- Genérico
    'arquiteturas-serverless-escalabilidade',-- Fora do foco cyber/GRC
    'n-cirt-crises-ciberneticas-e-forense', -- Retido: ransomware-playbook-4-horas
    'contrainteligencia-defesa-ativa'       -- Genérico
);
