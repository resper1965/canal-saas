# PLAN: Modernização Administrativa Final (VisionOS Pro-Max)

Este plano detalha a fase final da modernização sistemática das rotas do Canal Admin, focando na uniformização estética Pro-Max e conformidade com alvos de interação de 44px.

## Overview
- **Objetivo**: Aplicar design system VisionOS Pro-Max e leis da UX (Lei de Fitts) em todas as rotas remanescentes.
- **Duração Estimada**: 1-2 sessões de implementação intensiva.
- **Padrões**: Glassmorphism, 44px targets, tipografia técnica (tracking-widest), localização PT-BR.

## Project Type
**WEB** (Vite + React + Tailwind CSS)

## Success Criteria
- [ ] Todas as rotas em `src/routes/` modernizadas para o padrão Glassmorphic.
- [ ] Todos os elementos interativos (botões, inputs) com altura mínima de 44px (`h-11`).
- [ ] Localização integral para PT-BR (mensagens, labels, placeholders).
- [ ] Build de produção sem warnings de CSS ou lints.
- [ ] Verificação positiva via `ux_audit.py`.

## Tech Stack
- **Styling**: Tailwind CSS v3/v4 (glassmorphism details, backdrop-blur).
- **Icons**: Lucide React (standardized at 16px/18px width).
- **Transitions**: Native Tailwind anima-in sequences.

## Task Breakdown

### Phase 1: Communication & Awareness (Priority)
| Task ID | Component | Agent | Description | Verify |
|---------|-----------|-------|-------------|--------|
| T1 | `login.tsx` | @frontend-specialist | Refatorar tela de login para estética premium Pro-Max com profundidade espacial. | Página de login com glassmorphism e 44px targets. |
| T2 | `communications.tsx` | @frontend-specialist | Modernizar inbox e feeds de comunicação. | Layout de mensagens limpo e 44px targets em ações. |
| T3 | `emergency.tsx` | @frontend-specialist | Refatorar dashboard de alertas críticos para alta legibilidade. | Cores de alerta harmonizadas com design system. |

### Phase 2: Operations & Data
| Task ID | Component | Agent | Description | Verify |
|---------|-----------|-------|-------------|--------|
| T4 | `compliance.tsx` | @frontend-specialist | Padronizar tabelas de auditoria e logs de segurança. | Tabelas seguindo o padrão `EntryTable` modernizado. |
| T5 | `knowledge-base.tsx` | @frontend-specialist | Refatorar grid de artigos e base de conhecimento. | Visual limpo com cards Pro-Max. |
| T6 | `media.tsx` | @frontend-specialist | Modernizar o Gallery Manager (mosaico de mídias). | Previews com glassmorphism e bordas suaves. |

### Phase 3: Infrastructure & Users
| Task ID | Component | Agent | Description | Verify |
|---------|-----------|-------|-------------|--------|
| T7 | `saas-billing.tsx` | @frontend-specialist | Modernizar painel de faturamento e planos. | Visual de "Pricing" premium no admin. |
| T8 | `users.tsx` | @frontend-specialist | Refatorar gestão de permissões e usuários. | Switchers e inputs h-11. |
| T9 | `signatures.tsx` | @frontend-specialist | Modernizar gestão de assinaturas digitais/vCards. | Layout centrado e premium. |
| T10| `social-calendar.tsx` | @frontend-specialist | Modernizar visualização de calendário e agendamentos. | Grid de datas limpo e acessível. |

### Phase 4: Final Polishing
| Task ID | Component | Agent | Description | Verify |
|---------|-----------|-------|-------------|--------|
| T11 | `decks.tsx` | @frontend-specialist | Modernizar gerenciador de apresentações (decks). | Layout de grids consistente. |
| T12 | Auditoria UX | @frontend-specialist | Rodar check geral de acessibilidade e Fitts' Law. | `python .agent/skills/frontend-design/scripts/ux_audit.py src/routes/` |

## Phase X: Final Verification
- [ ] `npm run lint` pass.
- [ ] `npm run build` success.
- [ ] `python .agent/skills/frontend-design/scripts/ux_audit.py .` passes quality gate.
- [ ] Verificação manual de 44px em todos os novos botões.
- [ ] Testes de E2E (opcional/se solicitado).
