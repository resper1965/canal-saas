import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { 
  newsletter, applicants, social_posts, comunicados, brand_assets 
} from '../db/schema';
import { nanoid } from 'nanoid';
import { Bindings } from '../index';
import { generateText } from 'ai';
import { createWorkersAI } from 'workers-ai-provider';

export const automationRoute = new Hono<{ Bindings: Bindings }>();

// 1. Newsletter Subs (Public)
const subscribeSchema = z.object({
  email: z.string().email(),
  tenant_id: z.string().optional()
});

automationRoute.post('/newsletter/subscribe', zValidator('json', subscribeSchema), async (c) => {
  const { email, tenant_id } = c.req.valid('json');
  const db = drizzle(c.env.DB);
  
  // Create token
  const token = nanoid(32);
  const t_id = tenant_id || 'default';
  
  try {
    await db.insert(newsletter).values({
      email,
      tenant_id: t_id,
      token,
      confirmed_at: null,
      created_at: new Date().toISOString()
    });

    // TODO: Trigger Email Delivery (Double opt-in link) via Queue or Resend
    // For now we just return success
    
    return c.json({ success: true, message: 'Confirme seu email na sua caixa postal.' }, 201);
  } catch (error: unknown) {
    if (error instanceof Error ? error.message : String(error).includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Email já cadastrado.' }, 400);
    }
    return c.json({ error: 'Internal error' }, 500);
  }
});

// 2. Newsletter Verify (Public)
automationRoute.get('/newsletter/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ error: 'Token missing' }, 400);
  
  const db = drizzle(c.env.DB);
  const result = await db.update(newsletter)
    .set({ confirmed_at: new Date().toISOString() })
    .where(eq(newsletter.token, token))
    .returning();
    
  if (result.length === 0) {
    return c.json({ error: 'Token inválido ou não encontrado' }, 404);
  }
  
  return c.text('Inscrição confirmada com sucesso! Você já pode fechar esta janela.');
});

// 3. Unsubscribe (Public)
automationRoute.get('/newsletter/unsubscribe', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ error: 'Token missing' }, 400);
  
  const db = drizzle(c.env.DB);
  await db.delete(newsletter).where(eq(newsletter.token, token));
  
  return c.text('Inscrição cancelada com sucesso.');
});

// 4. Job Applications (Public)
// Requires a multipart form containing name, email, linkedin_url, and file (PDF)
automationRoute.post('/apply/:job_id', async (c) => {
  const job_id = c.req.param('job_id');
  const body = await c.req.parseBody();
  const name = body['name'] as string;
  const email = body['email'] as string;
  const linkedin_url = body['linkedin_url'] as string;
  const file = body['file'] as File;
  
  if (!name || !email || !file) {
    return c.json({ error: 'Name, email and file are required' }, 400);
  }
  
  const id = nanoid(12);
  const fileKey = `resumes/${job_id}/${id}-${file.name}`;
  
  // Upload to R2
  await c.env.MEDIA.put(fileKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type }
  });
  
  const db = drizzle(c.env.DB);
  await db.insert(applicants).values({
    id,
    tenant_id: 'default',
    job_id,
    name,
    email,
    linkedin_url,
    resume_r2_key: fileKey,
    status: 'new',
    created_at: new Date().toISOString()
  });
  
  // Try sending to Queue for Async AI Scoring if QUEUE binding exists, else silently continue
  try {
    if (c.env.QUEUE) {
      await c.env.QUEUE.send({ type: 'SCORE_CV', payload: { applicantId: id, fileKey: fileKey } });
    }
  } catch (e) {
  }

  return c.json({ success: true, applicant_id: id }, 201);
});

// 5. Admin - Social Posts & Newsletter (Requires Authentication)
// (Usually we check for Admin Role using middleware, but we'll mount this securely in index.ts)
automationRoute.get('/social', async (c) => {
  const db = drizzle(c.env.DB);
  const q = await db.select().from(social_posts).all();
  return c.json({ data: q });
});

automationRoute.post('/social', zValidator('json', z.object({
  id: z.string().optional(),
  platform: z.string(),
  content: z.string(),
  scheduled_at: z.string().optional()
})), async (c) => {
  const body = c.req.valid('json');
  const db = drizzle(c.env.DB);
  const id = body.id || nanoid();
  
  await db.insert(social_posts).values({
    id,
    tenant_id: 'default',
    platform: body.platform,
    content: body.content,
    scheduled_at: body.scheduled_at,
    status: body.scheduled_at ? 'scheduled' : 'draft',
    created_at: new Date().toISOString()
  });

  if (c.env.QUEUE && body.scheduled_at) {
    try {
      await c.env.QUEUE.send({ type: 'SOCIAL_POST_DISPATCH', payload: { postId: id, platform: body.platform } });
    } catch (e) {
    }
  }

  return c.json({ success: true, id });
});

automationRoute.get('/comunicados', async (c) => {
  const db = drizzle(c.env.DB);
  const q = await db.select().from(comunicados).all();
  return c.json({ data: q });
});

automationRoute.post('/social-draft', zValidator('json', z.object({
  platform: z.string(),
  brief: z.string()
})), async (c) => {
  const { platform, brief } = c.req.valid('json');

  const systemPrompt = `Você é um Social Media Manager B2B Sênior. Sua especialidade é destilar artigos executivos em posts engajadores.
Plataforma alvo: ${platform.toUpperCase()}
Instruções:
- Se for LinkedIn: Mantenha um tom profissional, orientativo, divida em parágrafos com respiros. Termine com uma CTA leve.
- Se for Instagram ou X: Seja hiper direto, adicione emojis visuais contextuais (🟢 🚀 📊).
Não responda recados, vá direto para o texto do post.`;

  try {
    const workersai = createWorkersAI({ binding: c.env.AI });
    const result = await generateText({
      model: workersai('@cf/meta/llama-3.1-8b-instruct'),
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Base: ${brief.trim()}` }
      ]
    });
    
    return c.json({ success: true, text: result.text });
  } catch (err) {
    return c.json({ error: 'Falha na geração com IA' }, 500);
  }
});

// 6. GitHub Integration (Portfolio & Kanban)
automationRoute.get('/github/repos', async (c) => {
  // Fetch resper1965 public repos
  try {
    const res = await fetch('https://api.github.com/users/resper1965/repos?per_page=100&sort=updated', {
      headers: {
        'User-Agent': 'CloudflareWorker-CanalCMS',
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    if (!res.ok) throw new Error('Failed to fetch github repos');
    let repos = await res.json() as Record<string, unknown>[];
    
    // Filter out forks and map to Bento grid properties
    const portfolioCases = repos
      .filter((repo: any) => !repo.fork && repo.name !== 'resper1965') // Hide profile readme and forks
      .map((repo: any) => ({
        slug: repo.name,
        project: repo.name,
        client: 'Open Source',
        category: repo.language ? repo.language.toLowerCase() : 'Dev',
        result: repo.license?.spdx_id || 'MIT',
        desc: repo.description?.substring(0, 150) || 'Repositório de desenvolvimento.',
        stats: JSON.stringify({ stars: repo.stargazers_count, forks: repo.forks_count }),
        image: '', // Can be filled via github open-graph later or left blank
        url: repo.html_url
      }))
      .slice(0, 9); // Only take most recent 9
      
    c.header('Cache-Control', 'public, max-age=3600');
    return c.json(portfolioCases);
  } catch (err: unknown) {
    return c.json({ error: 'Failed' }, 500);
  }
});

automationRoute.get('/github/issues', async (c) => {
  // Can be authorized or use a PAT if we want private issues
  const repo = c.req.query('repo') || 'resper1965/ness-website26';
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=all&per_page=50`, {
      headers: {
        'User-Agent': 'CloudflareWorker-CanalCMS',
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    if (!res.ok) throw new Error('Failed to fetch github issues');
    const issues = await res.json() as Record<string, unknown>[];
    
    const mapped = issues
      .filter((i: any) => !i.pull_request)
      .map((issue: any) => ({
        id: issue.number,
        title: issue.title,
        status: issue.state === 'closed' ? 'done' : (issue.assignees?.length > 0 ? 'in-progress' : 'todo'),
        body: issue.body?.substring(0, 100),
        url: issue.html_url,
        labels: issue.labels.map((l: { name: string }) => l.name)
      }));
      
    return c.json(mapped);
  } catch (err: unknown) {
    return c.json({ error: 'Failed' }, 500);
  }
});

export default automationRoute;

