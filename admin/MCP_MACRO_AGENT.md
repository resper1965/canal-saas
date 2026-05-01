# Especificação de Autenticação: Agente Macro (MCP)

Este documento é estrito e confidencial à seção administrativa da NESS. Destina-se apenas aos engenheiros e orquestradores que realizarão a ponte de conexão do **Agente Maior** (Macro-AI) com as bases de dados deste Canal CMS.

---

O Canal CMS expõe ativamente o conteúdo de coleções, Casos de Estudo (Portfólio), Logs de Ouvidoria e Triage através das diretivas Serverless, de forma protegida.

O **Agente Maior** (Anthropic, n.core, etc) deverá utilizar o protocolo aberto **MCP (Model Context Protocol)** atrelado ao `Agent Auth Protocol` nativamente instalado.

## Endpoints Exclusos

1. Endpoint Alvo do MCP:
   `https://canal.ness.com.br/api/mcp/*`
2. Endpoint de Concessão de Token de Agente:
   `https://canal.ness.com.br/api/auth/agent/*`

---

## Fluxo de Conexão Criptografado (Opções 2 e 3)

Para ignorar pontes fracas (APIs hardcoded) e operar sob auditoria plena visível na Dashboard de Administrador:

### 1. Injeção e Registro de Token (Better Auth - Agent Auth)
O Agente Maior dispara uma requisição de inicialização POST (Auth request) configurada com suas credenciais ou sob modelo Autônomo. 
O Plugin de `agentAuth()` validará a requisição em tempo de compilação, cedendo um `Bearer Token`.
*(Alternativa manual: O administrador pode emitir e copiar este `agent_token` diretamente no banco de dados e colar como variável de ambiente no repositório do Agente Maior).*

### 2. O Handshake MCP (JSON-RPC)
Com o Token em mãos, o Agente Maior despacha todos os Callbacks padronizados do MCP (Tool calls, Resource List) enviando estritamente:

```http
POST /api/mcp/ HTTP/1.1
Host: canal.ness.com.br
Authorization: Bearer <agent_token>
```

**Resultado Arquitetural:**
1. O Middleware do arquivo `canal/src/index.ts` capta a requisição em `/api/mcp/*`.
2. A rotina avança direto para o *Hook* `requireAdminOrKey` da porta lógica.
3. O código utiliza o injetor silencioso `auth.api.getAgentSession()` e confere a integridade criptográfica.
4. O D1 espelha automaticamente os dados permitidos para a macro-leitura sem acionar Timeouts, tudo faturado e protegido no log de instâncias.

Isso bloqueia curiosos de acessarem as tabelais vitais sem o Auth_Token oficial da camada de Sistema.
