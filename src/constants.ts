/**
 * Canal SaaS — Shared Constants
 *
 * Replaces magic strings used across routes and handlers.
 */

export const ENTRY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const DSAR_STATUS = {
  RECEIVED: 'received',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const

export const CASE_STATUS = {
  NEW: 'new',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const

export type EntryStatus = typeof ENTRY_STATUS[keyof typeof ENTRY_STATUS]
export type DsarStatus = typeof DSAR_STATUS[keyof typeof DSAR_STATUS]
export type CaseStatus = typeof CASE_STATUS[keyof typeof CASE_STATUS]
