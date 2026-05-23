import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/shared/api'
import { AnalysisSummary, VERDICT_COLOR, VERDICT_EMOJI, TYPE_ICON } from '@/shared/types'

export default function Dashboard() {
  const [list, setList] = useState<AnalysisSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    api.analyses()
      .then(setList)
      .catch(() => setError('Не удалось загрузить'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loader">
      <div className="spinner" />
      <span>Загрузка анализов…</span>
    </div>
  )

  if (error) return (
    <div className="loader" style={{ color: '#ef4444' }}>
      <span style={{ fontSize: 32 }}>⚠️</span>
      <span>{error}</span>
    </div>
  )

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>История</div>
        <div style={{ fontSize: 13, color: 'var(--hint)', marginTop: 2 }}>
          {list.length > 0 ? `${list.length} анализов` : 'Пока пусто'}
        </div>
      </div>

      {list.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Анализов пока нет</div>
          <div style={{ fontSize: 13, color: 'var(--hint)', lineHeight: 1.5 }}>
            Отправь данные из Контур.Фокус в бот — результаты появятся здесь
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {list.map((a, i) => {
          const color = VERDICT_COLOR[a.verdict] ?? '#6b7280'
          const date = new Date(a.created_at).toLocaleDateString('ru', {
            day: 'numeric', month: 'short', year: 'numeric'
          })
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => nav(`/analysis/${a.id}`)}
              style={{
                background: 'var(--bg2)',
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
                marginBottom: 8,
                cursor: 'pointer',
                borderLeft: `3px solid ${color}`,
                WebkitTapHighlightColor: 'transparent',
                transition: 'opacity 0.1s',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>
                      {TYPE_ICON[a.input_type] ?? '•'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>#{a.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>{date}</span>
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text)',
                  }}>
                    {a.input_preview || '—'}
                  </div>
                </div>

                <div className="badge" style={{
                  background: color + '22',
                  color,
                  flexShrink: 0,
                }}>
                  {VERDICT_EMOJI[a.verdict]} {a.verdict}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
