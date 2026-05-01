-- Atualização de todas as imagens do Portfólio (Cases) 
-- utilizando as 4 imagens premium de fundo renderizadas

-- 1. Cluster Zero Trust & Governança Executiva
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/zero_trust.png') 
WHERE slug IN ('banco-digital-zero-trust', 'ecommerce-pci-dss-40', 'n-secops-abes');

-- 2. Cluster Resposta Rápida & OT / SOC
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/ransomware.png') 
WHERE slug IN ('fintech-contencao-ransomware', 'global-industrial-group', 'suporte-ot-energia', 'instituicao-financeira');

-- 3. Cluster Saúde, LGPD & Inteligência Logística
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/health.png') 
WHERE slug IN ('hospital-lgpd-dados-saude', 'operadora-saude-apt', 'healthtech', 'soc-global-ionic-health', 'logistica-integrada');

-- 4. Cluster DevSecOps & Automação de Carga
UPDATE entries SET data = json_set(data, '$.image', '/portfolio/devsecops.png') 
WHERE slug IN ('saas-b2b-devsecops', 'fintech-credito-dora', 'varejo-de-larga-escala', 'e-commerce-unicornio', 'gestao-nsecops-leite-tosto-barros', 'industria-iso27001-greenfield', 'large-scale-retail', 'unicorn-e-commerce', 'financial-institution', 'integrated-logistics', 'comercio-minorista', 'institucion-financiera');
