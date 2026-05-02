/**
 * Canal SaaS — Centralized Default Configuration
 *
 * Contains brand defaults that were previously hardcoded across routes.
 * In full multi-tenant mode, these should come from org metadata in D1.
 * For now, they serve as fallback defaults.
 */

export const DEFAULT_TENANT_ID = 'ness'

export const DEFAULT_BRAND = {
  name: 'ness.',
  website: 'https://ness.com.br',
  websiteDisplay: 'ness.com.br',
  logoWordmark: 'ness',
  tagline: 'Tecnologia que conecta, protege e transforma.',
  logo: 'https://ness.com.br/logo-ness.png',
  phone: '+55 11 3230-6757',
  commercial_email: 'comercial@ness.com.br',
  dpo_email: 'dpo@ness.com.br',
  color: '#00E5A0',
} as const

export const SUPER_ADMIN_EMAILS = [
  'admin@ness.com.br',
  'resper@ness.com.br',
  'resper@bekaa.eu',
] as const

export const SUB_BRANDS: Record<string, { name: string; color: string; domain: string; logo: string; tagline: string }> = {
  ness:   { name: 'ness.',  color: '#00E5A0', domain: 'ness.com.br',        logo: 'https://ness.com.br/logo-ness.png',        tagline: 'Tecnologia que conecta, protege e transforma.' },
  aegis:  { name: 'Aegis',  color: '#00B4D8', domain: 'aegis.ness.com.br',  logo: 'https://aegis.ness.com.br/logo-aegis.png',  tagline: 'Segurança Cibernética Gerenciada' },
  cavan:  { name: 'Cavan',  color: '#FF6B35', domain: 'cavan.ness.com.br',  logo: 'https://cavan.ness.com.br/logo-cavan.png',  tagline: 'Infraestrutura Inteligente' },
  tne:    { name: 'TNE',    color: '#4361EE', domain: 'tne.ness.com.br',    logo: 'https://tne.ness.com.br/logo-tne.png',      tagline: 'Telecomunicações & Redes' },
}
