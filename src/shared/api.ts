import { AnalysisFull, AnalysisSummary, GraphData, Stats } from './types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'X-Init-Data': getInitData(),
      'ngrok-skip-browser-warning': 'true',
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 100)}`)
  }
  return res.json()
}

export const api = {
  analyses: (savedOnly?: boolean) =>
    req<AnalysisSummary[]>(`/api/analyses${savedOnly ? '?saved=1' : ''}`),
  analysis: (id: number) => req<AnalysisFull>(`/api/analyses/${id}`),
  stats: () => req<Stats>('/api/stats'),
  deleteAnalysis: (id: number) =>
    req<{ ok: boolean }>(`/api/analyses/${id}`, { method: 'DELETE' }),
  toggleSave: (id: number) =>
    req<{ is_saved: boolean }>(`/api/analyses/${id}/save`, { method: 'POST' }),
  deleteUnsaved: () =>
    req<{ deleted: number }>('/api/analyses/unsaved', { method: 'DELETE' }),
  graph: (id: number) => req<GraphData>(`/api/analyses/${id}/graph`),
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        expand(): void
        close(): void
        BackButton: { show(): void; hide(): void; onClick(fn: () => void): void }
      }
    }
  }
}
