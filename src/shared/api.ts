import { AnalysisFull, AnalysisSummary, Stats } from './types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

async function req<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'X-Init-Data': getInitData(),
      'ngrok-skip-browser-warning': 'true',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  analyses: () => req<AnalysisSummary[]>('/api/analyses'),
  analysis: (id: number) => req<AnalysisFull>(`/api/analyses/${id}`),
  stats: () => req<Stats>('/api/stats'),
}

declare global {
  interface Window {
    Telegram?: { WebApp: { initData: string; expand(): void; close(): void; BackButton: { show(): void; hide(): void; onClick(fn: () => void): void } } }
  }
}
