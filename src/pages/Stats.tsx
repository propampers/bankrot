import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/shared/api'
import { Stats as StatsType, VERDICT_COLOR, VERDICT_EMOJI } from '@/shared/types'

export default function Stats() {
  const [data, setData] = useState<StatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader">Загрузка...</div>
  if (!data) return <div className="loader" style={{ color: '#ef4444' }}>Не удалось загрузить</div>

  const total = data.total_analyses || 1
  const verdictEntries = Object.entries(data.by_verdict) as [string, number][]

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Статистика</h1>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <StatTile label="Всего анализов" value={data.total_analyses} />
          <StatTile label="За 7 дней" value={data.last_7_days} accent />
        </div>

        {/* Verdict breakdown */}
        {verdictEntries.length > 0 && (
          <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>По вердиктам</div>
            {verdictEntries.map(([verdict, count]) => {
              const pct = Math.round((count / total) * 100)
              const color = VERDICT_COLOR[verdict] ?? '#888'
              return (
                <div key={verdict} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>
                      {VERDICT_EMOJI[verdict] ?? '•'} {verdict}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--hint)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 3, background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Input types */}
        {Object.keys(data.by_type).length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 10 }}>По типу данных</div>
            {(Object.entries(data.by_type) as [string, number][]).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{type}</span>
                <span style={{ fontSize: 13, color: 'var(--hint)' }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--hint)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
