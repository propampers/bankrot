export interface AnalysisSummary {
  id: number
  input_preview: string
  input_type: 'text' | 'pdf' | 'docx' | 'image'
  created_at: string
  verdict: Verdict
}

export interface AnalysisFull extends AnalysisSummary {
  result: string
}

export interface Stats {
  total: number
  verdicts: Record<string, number>
}

export type Verdict = 'ЖИР' | 'Норм' | 'Шлак' | 'МЁРТВЫЙ' | '—'

export const VERDICT_COLOR: Record<string, string> = {
  'ЖИР':    '#22c55e',
  'Норм':   '#3b82f6',
  'Шлак':   '#f97316',
  'МЁРТВЫЙ':'#ef4444',
  '—':      '#6b7280',
}

export const VERDICT_EMOJI: Record<string, string> = {
  'ЖИР':    '🔥',
  'Норм':   '👍',
  'Шлак':   '⚠️',
  'МЁРТВЫЙ':'💀',
  '—':      '❓',
}

export const TYPE_ICON: Record<string, string> = {
  text:  '📝',
  pdf:   '📄',
  docx:  '📃',
  image: '🖼',
}
