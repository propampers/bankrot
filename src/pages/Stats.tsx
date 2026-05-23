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

  const total = data.total || 1
  const verdictEntries = Object.entries(data.verdicts) as [string, number][]

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Статистика</h1>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Total */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--accent)' }}>{data.total}</div>
          <div style={{ fontSize: 13, color: 'var(--hint)', marginTop: 4 }}>анализов всего</div>
        </div>

        {/* Verdict breakdown */}
        {verdictEntries.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>По вердиктам</div>
            {verdictEntries.filter(([, count]) => count > 0).map(([verdict, count]) => {
              const pct = Math.round((count / total) * 100)
              const color = VERDICT_COLOR[verdict] ?? '#888'
              return (
                <div key={verdict} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>
                      {VERDICT_EMOJI[verdict] ?? '•'} {verdict}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--hint)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
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
      </motion.div>
    </div>
  )
}
