import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/shared/api'
import { AnalysisFull, VERDICT_COLOR, VERDICT_EMOJI } from '@/shared/types'

function parseRisks(text: string) {
  const risks: { icon: string; text: string; color: string }[] = []
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (t.startsWith('🔴')) risks.push({ icon: '🔴', text: t.slice(2).trim(), color: '#ef4444' })
    else if (t.startsWith('🟡')) risks.push({ icon: '🟡', text: t.slice(2).trim(), color: '#f59e0b' })
    else if (t.startsWith('✅')) risks.push({ icon: '✅', text: t.slice(2).trim(), color: '#22c55e' })
  }
  return risks
}

function extractSection(text: string, num: number): string {
  const start = text.indexOf(`## ${num}.`)
  if (start === -1) return ''
  const next = text.indexOf(`## ${num + 1}.`, start)
  return (next === -1 ? text.slice(start) : text.slice(start, next)).trim()
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

  if (loading) return (
    <div className="loader"><div className="spinner" /><span>Загрузка…</span></div>
  )
  if (!data) return (
    <div className="loader" style={{ color: '#ef4444' }}>
      <span style={{ fontSize: 32 }}>❌</span>
      <span>Анализ не найден</span>
    </div>
  )

  const risks = parseRisks(data.result)
  const batyaMatch = data.result.match(/## 10\. БАТЯ БЫ СКАЗАЛ:[^"]*"([^"]+)"/)
  const batyaSaid = batyaMatch?.[1] ?? ''
  const color = VERDICT_COLOR[data.verdict] ?? '#6b7280'

  const fin = extractSection(data.result, 2)
  const price = extractSection(data.result, 9)

  return (
    <div className="page" style={{ paddingTop: 12 }}>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back + meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => nav(-1)} style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 500 }}>
            ← Назад
          </button>
          <span style={{ fontSize: 12, color: 'var(--hint)' }}>
            #{data.id} · {new Date(data.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Verdict hero */}
        <div style={{
          background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
          border: `1px solid ${color}30`,
          borderRadius: 'var(--radius)',
          padding: '18px 18px 14px',
          marginBottom: 12,
        }}>
          <div className="verdict-big" style={{ color }}>{VERDICT_EMOJI[data.verdict]} {data.verdict}</div>
          {batyaSaid && (
            <p style={{
              marginTop: 10, fontSize: 13, color: 'var(--hint)',
              fontStyle: 'italic', lineHeight: 1.6,
              borderTop: `1px solid ${color}20`, paddingTop: 10,
            }}>
              «{batyaSaid}»
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg2)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 14,
          gap: 4,
        }}>
          {(['overview', 'full'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: tab === t ? 'var(--bg3)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--hint)',
                transition: 'all 0.15s',
              }}
            >
              {t === 'overview' ? '📊 Обзор' : '📄 Полный текст'}
            </button>
          ))}
        </div>
      </motion.div>

      {tab === 'overview' ? (
        <motion.div key="overview" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          {risks.length > 0 && (
            <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Маркеры риска</div>
              <div className="risk-list">
                {risks.map((r, i) => (
                  <div key={i} className="risk-item">
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fin && <SectionCard title="💰 Финансы" text={fin} />}
          {price && <SectionCard title="📌 Цена входа" text={price} />}

          {!risks.length && !fin && !price && (
            <div style={{ textAlign: 'center', color: 'var(--hint)', padding: '32px 0', fontSize: 14 }}>
              Структурированных данных нет — смотри полный текст
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div key="full" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
          <div className="card" style={{
            fontSize: 12,
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace',
            color: 'var(--hint)',
            overflowX: 'auto',
          }}>
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
      <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: l.startsWith('-') || l.startsWith('•') ? 'var(--text)' : 'var(--hint)',
          paddingLeft: l.startsWith('-') || l.startsWith('•') ? 4 : 0,
          marginBottom: 2,
        }}>
          {l}
        </div>
      ))}
    </div>
  )
}
