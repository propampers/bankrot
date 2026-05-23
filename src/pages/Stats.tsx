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

  if (loading) return (
    <div className="loader"><div className="spinner" /><span>Загрузка…</span></div>
  )
  if (!data) return (
    <div className="loader" style={{ color: '#ef4444' }}>
      <span style={{ fontSize: 32 }}>⚠️</span>
      <span>Не удалось загрузить</span>
    </div>
  )

  const total = data.total || 1
  const entries = Object.entries(data.verdicts).filter(([, n]) => n > 0) as [string, number][]
  const topVerdict = entries.sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="page">
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>Статистика</div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Big number */}
        <div className="card" style={{
          textAlign: 'center',
          padding: '28px 16px',
          background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)',
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: 'var(--accent)' }}>
            {data.total}
          </div>
          <div style={{ fontSize: 14, color: 'var(--hint)', marginTop: 6 }}>анализов проведено</div>
          {topVerdict && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--hint)' }}>
              Чаще всего:{' '}
              <span style={{ color: VERDICT_COLOR[topVerdict[0]], fontWeight: 700 }}>
                {VERDICT_EMOJI[topVerdict[0]]} {topVerdict[0]}
              </span>
              {' '}({topVerdict[1]} раз)
            </div>
          )}
        </div>

        {/* Verdicts breakdown */}
        {entries.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>По вердиктам</div>
            {entries.map(([verdict, count]) => {
              const pct = Math.round((count / total) * 100)
              const color = VERDICT_COLOR[verdict] ?? '#888'
              return (
                <div key={verdict} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {VERDICT_EMOJI[verdict]} {verdict}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--hint)', fontVariantNumeric: 'tabular-nums' }}>
                      {count} · {pct}%
                    </span>
                  </div>
                  <div style={{
                    height: 7,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                      style={{ height: '100%', borderRadius: 4, background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {data.total === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--hint)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
            Статистика появится после первых анализов
          </div>
        )}
      </motion.div>
    </div>
  )
}
