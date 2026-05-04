/**
 * Canal SaaS — Lead Pipeline API
 * 
 * Kanban pipeline, AI scoring, stage management, owner assignment.
 */

import { Hono } from 'hono'
import type { AdminEnv } from './_shared'
import { requirePermission, logAudit, getTenantId } from './_shared'

const pipeline = new Hono<AdminEnv>()

// Pipeline stage definitions
const STAGES = [
  { id: 'new', label: 'Novos', color: '#3b82f6' },
  { id: 'qualified', label: 'Qualificados', color: '#8b5cf6' },
  { id: 'contact', label: 'Em Contato', color: '#f59e0b' },
  { id: 'proposal', label: 'Proposta', color: '#06b6d4' },
  { id: 'won', label: 'Ganhos', color: '#00E5A0' },
  { id: 'lost', label: 'Perdidos', color: '#ef4444' },
]

// ── Pipeline Config ─────────────────────────────────────────────

pipeline.get('/pipeline/stages', (c) => {
  return c.json({ stages: STAGES })
})

// ── Pipeline Board (kanban data) ────────────────────────────────

pipeline.get('/pipeline', async (c) => {
  if (!(await requirePermission(c, { lead: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = getTenantId(c)

  const { results } = await c.env.DB.prepare(
    `SELECT id, name, contact, source, intent, urgency, status, stage, score, 
            owner_id, owner_name, company, notes, tags, last_activity, created_at, updated_at
     FROM leads WHERE tenant_id = ? 
     ORDER BY score DESC, created_at DESC`
  ).bind(tenantId).all()

  // Group by stage
  const board: Record<string, any[]> = {}
  for (const stage of STAGES) {
    board[stage.id] = []
  }
  for (const lead of (results || [])) {
    const s = (lead as any).stage || 'new'
    if (!board[s]) board[s] = []
    board[s].push({
      ...lead,
      tags: JSON.parse((lead as any).tags || '[]'),
    })
  }

  // Stats
  const total = (results || []).length
  const byStage = STAGES.map(s => ({ ...s, count: board[s.id].length }))
  const avgScore = total > 0 ? Math.round((results || []).reduce((sum, l) => sum + ((l as any).score || 0), 0) / total) : 0

  return c.json({ board, stages: byStage, stats: { total, avgScore } })
})

// ── Move Lead (Stage Change) ────────────────────────────────────

pipeline.patch('/pipeline/:id/stage', async (c) => {
  if (!(await requirePermission(c, { lead: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const tenantId = getTenantId(c)
  const { stage } = await c.req.json<{ stage: string }>()

  const validStages = STAGES.map(s => s.id)
  if (!validStages.includes(stage)) {
    return c.json({ error: `Invalid stage. Valid: ${validStages.join(', ')}` }, 400)
  }

  const now = new Date().toISOString()
  await c.env.DB.prepare(
    "UPDATE leads SET stage = ?, status = ?, last_activity = ?, updated_at = ? WHERE id = ? AND tenant_id = ?"
  ).bind(stage, stage === 'won' ? 'converted' : stage === 'lost' ? 'lost' : 'active', now, now, id, tenantId).run()

  logAudit(c, 'update', 'lead', id, `stage → ${stage}`)

  // Auto-notify if moved to 'won'
  if (stage === 'won') {
    const session = c.get('session') as any
    try {
      await c.env.DB.prepare(
        "INSERT INTO notifications (id, tenant_id, user_id, type, title, body, action_url, created_at) VALUES (?, ?, ?, 'lead_won', ?, ?, '/intelligence', datetime('now'))"
      ).bind(
        crypto.randomUUID(), tenantId, session?.user?.id || '',
        '🎉 Lead convertido!',
        `Lead #${id} foi marcado como ganho`
      ).run()
    } catch {}
  }

  return c.json({ success: true, stage })
})

// ── Update Lead Details ─────────────────────────────────────────

pipeline.patch('/pipeline/:id', async (c) => {
  if (!(await requirePermission(c, { lead: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const tenantId = getTenantId(c)
  const body = await c.req.json<{
    owner_id?: string;
    owner_name?: string;
    company?: string;
    notes?: string;
    tags?: string[];
    score?: number;
  }>()

  const sets: string[] = []
  const params: any[] = []

  if (body.owner_id !== undefined) { sets.push('owner_id = ?'); params.push(body.owner_id) }
  if (body.owner_name !== undefined) { sets.push('owner_name = ?'); params.push(body.owner_name) }
  if (body.company !== undefined) { sets.push('company = ?'); params.push(body.company) }
  if (body.notes !== undefined) { sets.push('notes = ?'); params.push(body.notes) }
  if (body.tags !== undefined) { sets.push('tags = ?'); params.push(JSON.stringify(body.tags)) }
  if (body.score !== undefined) { sets.push('score = ?'); params.push(body.score) }

  if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400)

  sets.push("updated_at = ?"); params.push(new Date().toISOString())
  sets.push("last_activity = ?"); params.push(new Date().toISOString())

  await c.env.DB.prepare(
    `UPDATE leads SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`
  ).bind(...params, id, tenantId).run()

  logAudit(c, 'update', 'lead', id, `pipeline update: ${Object.keys(body).join(', ')}`)
  return c.json({ success: true })
})

// ── AI Lead Scoring ─────────────────────────────────────────────

pipeline.post('/pipeline/:id/score', async (c) => {
  if (!(await requirePermission(c, { lead: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const tenantId = getTenantId(c)

  // Fetch lead data
  const lead = await c.env.DB.prepare(
    'SELECT * FROM leads WHERE id = ? AND tenant_id = ?'
  ).bind(id, tenantId).first()

  if (!lead) return c.json({ error: 'Lead not found' }, 404)

  const l = lead as any

  // Calculate score based on multiple signals
  let score = 0
  const reasons: string[] = []

  // 1. Has company → +20
  if (l.company && l.company.trim()) { score += 20; reasons.push('Empresa informada (+20)') }

  // 2. Intent quality
  if (l.intent) {
    const highIntentWords = ['orçamento', 'proposta', 'contratar', 'implementar', 'urgente', 'projeto', 'migrar', 'budget']
    const medIntentWords = ['conhecer', 'informação', 'dúvida', 'preço', 'comparar', 'solução']
    const intentLower = l.intent.toLowerCase()
    const hasHigh = highIntentWords.some(w => intentLower.includes(w))
    const hasMed = medIntentWords.some(w => intentLower.includes(w))
    if (hasHigh) { score += 30; reasons.push('Intenção alta (+30)') }
    else if (hasMed) { score += 15; reasons.push('Intenção média (+15)') }
    else { score += 5; reasons.push('Intenção genérica (+5)') }
  }

  // 3. Contact type
  if (l.contact) {
    if (l.contact.includes('@') && !l.contact.includes('gmail') && !l.contact.includes('hotmail') && !l.contact.includes('yahoo')) {
      score += 15; reasons.push('Email corporativo (+15)')
    } else if (l.contact.includes('@')) {
      score += 5; reasons.push('Email pessoal (+5)')
    }
    if (/\+?\d{10,}/.test(l.contact.replace(/\D/g, ''))) {
      score += 10; reasons.push('Telefone válido (+10)')
    }
  }

  // 4. Urgency
  if (l.urgency === 'alta' || l.urgency === 'crítica') { score += 15; reasons.push('Urgência alta (+15)') }
  else if (l.urgency === 'media') { score += 5; reasons.push('Urgência média (+5)') }

  // 5. Recency bonus
  const ageMs = Date.now() - new Date(l.created_at).getTime()
  const ageDays = ageMs / 86400000
  if (ageDays < 1) { score += 10; reasons.push('Lead recente (<24h) (+10)') }
  else if (ageDays < 7) { score += 5; reasons.push('Lead recente (<7d) (+5)') }

  // Cap at 100
  score = Math.min(score, 100)

  // Update score in DB
  await c.env.DB.prepare(
    "UPDATE leads SET score = ?, last_activity = ?, updated_at = ? WHERE id = ? AND tenant_id = ?"
  ).bind(score, new Date().toISOString(), new Date().toISOString(), id, tenantId).run()

  // Auto-promote: if score >= 60 and stage is 'new' → move to 'qualified'
  if (score >= 60 && l.stage === 'new') {
    await c.env.DB.prepare(
      "UPDATE leads SET stage = 'qualified' WHERE id = ? AND tenant_id = ?"
    ).bind(id, tenantId).run()
  }

  return c.json({ score, reasons, autoPromoted: score >= 60 && l.stage === 'new' })
})

// ── Batch Score All Leads ───────────────────────────────────────

pipeline.post('/pipeline/score-all', async (c) => {
  if (!(await requirePermission(c, { lead: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = getTenantId(c)

  const { results } = await c.env.DB.prepare(
    "SELECT id FROM leads WHERE tenant_id = ? AND (score IS NULL OR score = 0)"
  ).bind(tenantId).all()

  let scored = 0
  for (const lead of (results || [])) {
    // Fire individual score request internally
    const l = lead as any
    try {
      // Quick inline scoring (simplified)
      const full = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(l.id).first() as any
      if (!full) continue

      let score = 0
      if (full.company?.trim()) score += 20
      if (full.intent) {
        const hi = ['orçamento', 'proposta', 'contratar', 'projeto', 'urgente']
        if (hi.some(w => full.intent.toLowerCase().includes(w))) score += 30
        else score += 10
      }
      if (full.contact?.includes('@') && !full.contact.includes('gmail')) score += 15
      score = Math.min(score, 100)

      await c.env.DB.prepare(
        "UPDATE leads SET score = ?, updated_at = ? WHERE id = ?"
      ).bind(score, new Date().toISOString(), l.id).run()

      if (score >= 60 && full.stage === 'new') {
        await c.env.DB.prepare(
          "UPDATE leads SET stage = 'qualified' WHERE id = ?"
        ).bind(l.id).run()
      }
      scored++
    } catch {}
  }

  return c.json({ success: true, scored, total: (results || []).length })
})

// ── Pipeline Stats ──────────────────────────────────────────────

pipeline.get('/pipeline/stats', async (c) => {
  if (!(await requirePermission(c, { lead: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = getTenantId(c)

  const [stageCount, scoreAvg, recentCount, conversionRate] = await Promise.all([
    c.env.DB.prepare(
      "SELECT stage, COUNT(*) as count FROM leads WHERE tenant_id = ? GROUP BY stage"
    ).bind(tenantId).all(),
    c.env.DB.prepare(
      "SELECT AVG(score) as avg_score FROM leads WHERE tenant_id = ? AND score > 0"
    ).bind(tenantId).first<{ avg_score: number }>(),
    c.env.DB.prepare(
      "SELECT COUNT(*) as c FROM leads WHERE tenant_id = ? AND created_at >= datetime('now', '-7 days')"
    ).bind(tenantId).first<{ c: number }>(),
    c.env.DB.prepare(
      "SELECT CAST(SUM(CASE WHEN stage = 'won' THEN 1 ELSE 0 END) AS REAL) / NULLIF(COUNT(*), 0) * 100 as rate FROM leads WHERE tenant_id = ? AND stage IN ('won', 'lost')"
    ).bind(tenantId).first<{ rate: number }>(),
  ])

  return c.json({
    byStage: stageCount.results || [],
    avgScore: Math.round(scoreAvg?.avg_score || 0),
    newThisWeek: recentCount?.c || 0,
    conversionRate: Math.round(conversionRate?.rate || 0),
  })
})

export { pipeline }
