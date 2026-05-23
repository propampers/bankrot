import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/shared/api'
import { AnalysisFull, VERDICT_COLOR, VERDICT_EMOJI } from '@/shared/types'

function parseRisks(text: string) {
  const risks: { icon: string; text: string }[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('🔴') || trimmed.startsWith('🟡') || trimmed.startsWith('✅')) {
      const icon = trimmed[0]
      risks.push({ icon, text: trimmed.slice(2).trim() })
    }
  }
  return risks
}

function extractSection(text: string, num: number): string {
  const marker = `## ${num}.`
  const start = text.indexOf(marker)
  if (start === -1) return ''
  const nextMarker = text.indexOf(`## ${num + 1}.`, start)
  return (nextMarker === -1 ? text.slice(start) : text.slice(start, nextMarker)).trim()
}

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [data, setData] = useState<AnalysisFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'full'>('overview')

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(() => nav(-1))
    return () => window.Telegram?.WebApp?.BackButton?.hide()
  }, [nav])

  useEffect(() => {
    if (!id) return
    api.analysis(Number(id))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loader">Загрузка...</div>
  if (!data) return <div className="loader" style={{ color: '#ef4444' }}>Анализ не найден</div>

  const risks = parseRisks(data.result)
  const batyaMatch = data.result.match(/## 10\. БАТЯ БЫ СКАЗАЛ:[^"]*"([^"]+)"/)
  const batyaSaid = batyaMatch?.[1] ?? ''

  const verdict = data.verdict
  const vColor = VERDICT_COLOR[verdict]

  return (
    <div className="page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => nav(-1)} style={{ color: 'var(--hint)', fontSize: 14 }}>← Назад</button>
          <span style={{ fontSize: 13, color: 'var(--hint)' }}>
            #{data.id} · {new Date(data.created_at).toLocaleDateString('ru')}
          </span>
        </div>

        {/* Verdict */}
        <div className="card" style={{ borderLeft: `4px solid ${vColor}`, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="verdict-big" style={{ color: vColor }}>
              {VERDICT_EMOJI[verdict]} {verdict}
            </span>
          </div>
          {batyaSaid && (
            <p style={{ marginTop: 10, fontSize: 14, color: 'var(--hint)', fontStyle: 'italic', lineHeight: 1.5 }}>
              «{batyaSaid}»
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['overview', 'full'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: tab === t ? 'var(--accent)' : 'var(--bg2)',
                color: tab === t ? '#fff' : 'var(--hint)',
                transition: 'all 0.15s',
              }}
            >
              {t === 'overview' ? '📊 Обзор' : '📄 Полный текст'}
            </button>
          ))}
        </div>
      </motion.div>

      {tab === 'overview' ? (
        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Risk markers */}
          {risks.length > 0 && (
            <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Маркеры риска</div>
              <div className="risk-list">
                {risks.map((r, i) => (
                  <div key={i} className="risk-item">
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                    <span style={{ fontSize: 13 }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2 — Financials */}
          {extractSection(data.result, 2) && (
            <SectionCard title="💰 Финансы" text={extractSection(data.result, 2)} />
          )}

          {/* Section 9 — Price */}
          {extractSection(data.result, 9) && (
            <SectionCard title="📌 Цена входа" text={extractSection(data.result, 9)} />
          )}
        </motion.div>
      ) : (
        <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card" style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {data.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SectionCard({ title, text }: { title: string; text: string }) {
  const lines = text.split('\n').slice(1).filter(l => l.trim())
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 13, lineHeight: 1.6, color: l.startsWith('-') ? 'var(--text)' : 'var(--hint)' }}>
          {l}
        </div>
      ))}
    </div>
  )
}
