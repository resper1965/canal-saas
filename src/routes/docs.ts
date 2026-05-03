/**
 * Canal CMS — OpenAPI Documentation Routes
 * 
 * Gera automaticamente a spec OpenAPI 3.1 baseada nas collections
 * e serve um Swagger UI interativo.
 */

import { Hono } from 'hono'
import { collections } from '../collections'
import type { Bindings } from '../index'

type DocsEnv = { Bindings: Bindings }

export const docs = new Hono<DocsEnv>()

// ── OpenAPI 3.1 Spec ────────────────────────────────────────────
docs.get('/openapi.json', (c) => {
  const baseUrl = c.env.BETTER_AUTH_URL || 'https://canal.bekaa.eu'
  
  const paths: Record<string, Record<string, unknown>> = {
    '/api/v1/collections': {
      get: {
        tags: ['Collections'],
        summary: 'List all content collections',
        description: 'Returns metadata for all registered content types (insights, cases, jobs, etc.)',
        responses: {
          '200': {
            description: 'Array of collection definitions',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Collection' } } } }
          }
        }
      }
    },
    '/api/v1/collections/{slug}': {
      get: {
        tags: ['Collections'],
        summary: 'Get collection schema',
        description: 'Returns the full definition including field types for a specific collection',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'Collection slug (e.g., insights, cases, jobs)' }
        ],
        responses: {
          '200': { description: 'Collection definition with fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/CollectionFull' } } } },
          '404': { description: 'Collection not found' }
        }
      }
    }
  }

  // Auto-generate entry paths per collection
  for (const col of collections) {
    const tag = col.labelPlural || col.label
    
    paths[`/api/v1/collections/${col.slug}/entries`] = {
      get: {
        tags: [tag],
        summary: `List ${col.labelPlural || col.label}`,
        description: `Returns paginated entries from the "${col.slug}" collection`,
        security: [{ apiKey: [] }, {}],
        parameters: [
          ...(col.hasStatus ? [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['published', 'draft', 'all'], default: 'published' } }] : []),
          ...(col.hasLocale ? [{ name: 'locale', in: 'query', schema: { type: 'string', default: 'pt' }, description: 'Language code (pt, en, es)' }] : []),
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: `Paginated list of ${col.slug}`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: `#/components/schemas/Entry_${col.slug}` } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: [tag],
        summary: `Create ${col.label}`,
        description: `Creates a new entry in the "${col.slug}" collection. Requires authentication.`,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/Entry_${col.slug}_Create` }
            }
          }
        },
        responses: {
          '201': { description: 'Entry created', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' }, slug: { type: 'string' }, status: { type: 'string' } } } } } },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' }
        }
      }
    }

    paths[`/api/v1/collections/${col.slug}/entries/{id}`] = {
      get: {
        tags: [tag],
        summary: `Get ${col.label} by ID or slug`,
        security: [{ apiKey: [] }, {}],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Entry UUID or slug' },
          ...(col.hasLocale ? [{ name: 'locale', in: 'query', schema: { type: 'string', default: 'pt' } }] : []),
        ],
        responses: {
          '200': { description: `${col.label} details`, content: { 'application/json': { schema: { $ref: `#/components/schemas/Entry_${col.slug}` } } } },
          '404': { description: 'Entry not found' }
        }
      },
      put: {
        tags: [tag],
        summary: `Update ${col.label}`,
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: `#/components/schemas/Entry_${col.slug}_Create` } } } },
        responses: {
          '200': { description: 'Entry updated' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Entry not found' }
        }
      },
      delete: {
        tags: [tag],
        summary: `Delete ${col.label}`,
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Entry deleted' }, '401': { description: 'Unauthorized' } }
      }
    }
  }

  // Additional utility paths
  paths['/api/v1/media/upload'] = {
    post: {
      tags: ['Media'],
      summary: 'Upload a file to R2 storage',
      security: [{ bearerAuth: [] }],
      requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
      responses: { '200': { description: 'File uploaded' }, '401': { description: 'Unauthorized' } }
    }
  }

  paths['/api/chatbot-config'] = {
    get: {
      tags: ['Chatbot'],
      summary: 'Get chatbot configuration for a tenant',
      parameters: [{ name: 'tenant', in: 'query', schema: { type: 'string', default: 'ness' } }],
      responses: { '200': { description: 'Chatbot config (name, avatar, colors, welcome message)' } }
    }
  }

  paths['/api/chat'] = {
    post: {
      tags: ['Chatbot'],
      summary: 'Send a message to the AI chatbot (RAG)',
      description: 'Rate limited (20 req/min). Connects to the GabiAgent Durable Object for streaming responses.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ChatRequest' } } }
      },
      responses: { '200': { description: 'Streaming AI response' }, '429': { description: 'Rate limited' } }
    }
  }

  // Build entry schemas from collection definitions
  const schemas: Record<string, Record<string, unknown>> = {
    Collection: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        label: { type: 'string' },
        labelPlural: { type: 'string' },
        icon: { type: 'string' },
        hasLocale: { type: 'boolean' },
        hasSlug: { type: 'boolean' },
        hasStatus: { type: 'boolean' },
        fieldCount: { type: 'integer' },
      }
    },
    CollectionFull: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        label: { type: 'string' },
        fields: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' }, required: { type: 'boolean' } } } }
      }
    },
    PaginationMeta: {
      type: 'object',
      properties: {
        collection: { type: 'string' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
      }
    },
    ChatRequest: {
      type: 'object',
      required: ['messages'],
      properties: {
        messages: { type: 'array', items: { type: 'object', properties: { role: { type: 'string', enum: ['user', 'assistant'] }, content: { type: 'string', maxLength: 4000 } } } },
        locale: { type: 'string' },
      }
    }
  }

  // Generate entry schemas per collection
  for (const col of collections) {
    const fieldTypeMap: Record<string, string> = {
      text: 'string', textarea: 'string', richtext: 'string', slug: 'string',
      select: 'string', date: 'string', image: 'string', relation: 'string',
      number: 'number', boolean: 'boolean', json: 'object',
    }

    const props: Record<string, Record<string, unknown>> = {
      id: { type: 'string', format: 'uuid' },
      slug: { type: 'string' },
      locale: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    }
    const createProps: Record<string, Record<string, unknown>> = {}
    const required: string[] = []

    for (const field of col.fields) {
      const jsonType = fieldTypeMap[field.type] || 'string'
      const fieldDef: Record<string, unknown> = { type: jsonType }
      if (field.label) fieldDef.description = field.label
      if (field.options) fieldDef.enum = field.options
      if (field.defaultValue !== undefined) fieldDef.default = field.defaultValue

      props[field.name] = fieldDef
      createProps[field.name] = { ...fieldDef }
      if (field.required) required.push(field.name)
    }

    schemas[`Entry_${col.slug}`] = { type: 'object', properties: props }
    schemas[`Entry_${col.slug}_Create`] = { type: 'object', properties: createProps, ...(required.length ? { required } : {}) }
  }

  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Canal CMS API',
      version: '1.0.0',
      description: 'API Headless CMS multi-tenant. Conteúdo acessível via API keys ou sessão autenticada.\n\n## Autenticação\n\n**API Key (para sites):** `Authorization: Bearer pk_xxx`\n\n**Session Cookie (admin panel):** cookies automáticos via Better Auth\n\n## Quick Start\n\n```javascript\nconst res = await fetch("https://canal.bekaa.eu/api/v1/collections/insights/entries?status=published&limit=10", {\n  headers: { "Authorization": "Bearer pk_YOUR_API_KEY" }\n})\nconst { data, meta } = await res.json()\n```',
      contact: { name: 'Canal CMS', url: baseUrl },
    },
    servers: [
      { url: baseUrl, description: 'Production' },
      { url: 'http://localhost:8787', description: 'Local Development' },
    ],
    paths,
    components: {
      schemas,
      securitySchemes: {
        apiKey: { type: 'http', scheme: 'bearer', bearerFormat: 'API Key (pk_xxx)', description: 'API Key gerada no admin panel. Usada por sites externos para leitura de conteúdo.' },
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'Session Token', description: 'Token de sessão autenticado via Better Auth. Requerido para operações de escrita.' },
      }
    },
    tags: [
      { name: 'Collections', description: 'Content type definitions and schemas' },
      ...collections.map(col => ({ name: col.labelPlural || col.label, description: `CRUD for ${col.slug} entries` })),
      { name: 'Media', description: 'File upload and delivery' },
      { name: 'Chatbot', description: 'AI chatbot configuration and interaction' },
    ]
  }

  c.header('Cache-Control', 'public, max-age=300')
  return c.json(spec)
})

// ── Swagger UI ──────────────────────────────────────────────────
docs.get('/docs', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canal CMS — API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #0a0a0a; }
    .swagger-ui { max-width: 1200px; margin: 0 auto; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 40px 0 20px; }
    .swagger-ui .info .title { color: #fff; }
    .swagger-ui .info .description p { color: #ccc; }
    .swagger-ui .scheme-container { background: #111; border: 1px solid #222; }
    .swagger-ui .opblock-tag { color: #ddd; border-bottom: 1px solid #222; }
    .swagger-ui .opblock { border: 1px solid #222; background: #111; }
    .swagger-ui .opblock .opblock-summary { border-bottom: 1px solid #222; }
    .swagger-ui .btn { border-radius: 6px; }
    .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #00E5A0; }
    .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #0099FF; }
    .swagger-ui .opblock.opblock-put .opblock-summary { border-color: #FFB800; }
    .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #FF4444; }
    .custom-header { background: linear-gradient(135deg, #0a0a0a 0%, #111 100%); padding: 40px; text-align: center; border-bottom: 1px solid #222; }
    .custom-header h1 { color: #fff; margin: 0; font-family: system-ui; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .custom-header h1 span { color: #00E5A0; }
    .custom-header p { color: #888; margin: 8px 0 0; font-family: system-ui; font-size: 14px; }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>Canal<span>.</span>CMS</h1>
    <p>API Documentation — Headless CMS Multi-Tenant</p>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      defaultModelsExpandDepth: 1,
      tryItOutEnabled: true,
    })
  </script>
</body>
</html>`
  return c.html(html)
})
