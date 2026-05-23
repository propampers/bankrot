import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      .catch(() => setError('Не удалось загрузить анализы'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader">Загрузка...</div>
  if (error) return <div className="loader" style={{ color: '#ef4444' }}>{error}</div>

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>История анализов</h1>

      {list.length === 0 && (
        <div className="card" style={{ color: 'var(--hint)', textAlign: 'center', padding: '32px 16px' }}>
          Анализов пока нет.<br/>Отправь данные из Контур.Фокус в бот.
        </div>
      )}

      {list.map((a, i) => (
        <motion.div
          key={a.id}
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => nav(`/analysis/${a.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--hint)', marginBottom: 4 }}>
                {TYPE_ICON[a.input_type] ?? '•'}&nbsp;
                {new Date(a.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.input_preview || '—'}
              </div>
            </div>
            <span
              className="badge"
              style={{ background: VERDICT_COLOR[a.verdict] + '22', color: VERDICT_COLOR[a.verdict], flexShrink: 0 }}
            >
              {VERDICT_EMOJI[a.verdict]} {a.verdict}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
