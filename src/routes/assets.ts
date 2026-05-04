/**
 * Canal SaaS — Asset Delivery Routes
 * 
 * Edge image delivery with CF Image Resizing + OG image generator.
 * Extracted from index.ts for modularity.
 */

import { Hono } from 'hono'
import type { Bindings, Variables } from '../index'

const assets = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ── Edge Image Delivery ─────────────────────────────────────────
assets.get('/media/:filename', async (c) => {
  const filename = c.req.param('filename')
  const imageUrl = new URL(`https://media.seucdn.com/${filename}`)
  const width = c.req.query('w') || '1200'
  const quality = c.req.query('q') || '85'

  const requestInit = {
    headers: c.req.raw.headers,
    cf: {
      image: {
        width: parseInt(width),
        format: 'auto',
        quality: parseInt(quality),
      }
    }
  } as unknown as RequestInit;

  const imageRequest = new Request(imageUrl, requestInit)

  try {
    const res = await fetch(imageRequest)
    const newHeaders = new Headers(res.headers)
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
    return new Response(res.body, { status: res.status, headers: newHeaders })
  } catch {
    return c.json({ error: 'Falha no processamento de Imagem Edge' }, 500)
  }
})

// ── OG Image Generator ──────────────────────────────────────────
assets.get('/api/og', (c) => {
  const title = c.req.query('title') || 'Canal CMS'
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="111" />
      <text x="600" y="315" fill="white" font-family="sans-serif" font-size="64" font-weight="900" text-anchor="middle" dominant-baseline="middle">
        ${title}
      </text>
    </svg>
  `
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
})

export { assets }
