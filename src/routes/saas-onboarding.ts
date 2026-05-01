import { Hono } from 'hono';
import { Bindings } from '../index';

export const saasRoutes = new Hono<{ Bindings: Bindings }>();

// Gerar link de pagamento (Stripe Mock)
saasRoutes.post('/billing/checkout', async (c) => {
  const data = await c.req.json().catch(() => ({}));
  const tenantId = data.tenantId || 'demo-tenant';
  const plan = data.plan || 'pro';
  
  // Mock Checkout session URL
  return c.json({
    url: `https://mock-stripe.checkout.com/${tenantId}/${plan}?session_id=${crypto.randomUUID()}`
  });
});

// Resgatar status de assinatura (Stripe Mock)
saasRoutes.get('/billing/status/:tenantId', async (c) => {
  const tenantId = c.req.param('tenantId');
  
  return c.json({
    tenantId: tenantId,
    status: 'active',
    plan: 'pro',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
});
