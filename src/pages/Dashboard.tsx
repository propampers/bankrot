import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/shared/api'
import { AnalysisSummary, VERDICT_COLOR, VERDICT_EMOJI, TYPE_ICON } from '@/shared/types'

type Tab = 'all' | 'saved'

export default function Dashboard() {
  const [list, setList] = useState<AnalysisSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [clearing, setClearing] = useState(false)
  const nav = useNavigate()

  const load = (savedOnly = false) => {
    setLoading(true)
    api.analyses(savedOnly)
      .then(setList)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab === 'saved') }, [tab])

  const handleStar = async (e: React.MouseEvent, a: AnalysisSummary) => {
    e.stopPropagation()
    try {
      const res = await api.toggleSave(a.id)
      setList(prev => prev.map(item =>
        item.id === a.id ? { ...item, is_saved: res.is_saved } : item
      ))
      if (tab === 'saved' && !res.is_saved) {
        setList(prev => prev.filter(item => item.id !== a.id))
      }
    } catch { /* ignore */ }
  }

  const handleClearUnsaved = async () => {
    if (!window.confirm('Удалить все несохранённые анализы?')) return
    setClearing(true)
    try {
      await api.deleteUnsaved()
      load(tab === 'saved')
    } finally {
      setClearing(false)
    }
  }

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>История</div>
          <div style={{ fontSize: 13, color: 'var(--hint)', marginTop: 2 }}>
            {list.length > 0 ? `${list.length} анализов` : 'Пока пусто'}
          </div>
        </div>
        {tab === 'all' && list.some(a => !a.is_saved) && (
          <button
            onClick={handleClearUnsaved}
            disabled={clearing}
            style={{
              fontSize: 12, color: '#ef4444', padding: '6px 10px',
              background: 'rgba(239,68,68,0.1)', borderRadius: 8,
              opacity: clearing ? 0.5 : 1,
            }}
          >
            {clearing ? '…' : 'Очистить'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--bg2)',
        borderRadius: 10, padding: 4, marginBottom: 14, gap: 4,
      }}>
        {(['all', 'saved'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 7,
              fontSize: 13, fontWeight: 600,
              background: tab === t ? 'var(--bg3)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--hint)',
              transition: 'all 0.15s',
            }}
          >
            {t === 'all' ? '📋 Все' : '⭐ Сохранённые'}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {tab === 'saved' ? '⭐' : '📭'}
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {tab === 'saved' ? 'Нет сохранённых' : 'Анализов пока нет'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--hint)', lineHeight: 1.5 }}>
            {tab === 'saved'
              ? 'Отметь звёздочкой важные анализы — они появятся здесь'
              : 'Отправь данные из Контур.Фокус в бот — результаты появятся здесь'}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {list.map((a, i) => {
          const color = VERDICT_COLOR[a.verdict] ?? '#6b7280'
          const date = new Date(a.created_at).toLocaleDateString('ru', {
            day: 'numeric', month: 'short', year: 'numeric',
          })
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => nav(`/analysis/${a.id}`)}
              style={{
                background: 'var(--bg2)',
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
                marginBottom: 8,
                cursor: 'pointer',
                borderLeft: `3px solid ${color}`,
                WebkitTapHighlightColor: 'transparent',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>{TYPE_ICON[a.input_type] ?? '•'}</span>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>#{a.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--hint)' }}>{date}</span>
                    {a.is_saved && <span style={{ fontSize: 10, color: '#f59e0b' }}>⭐</span>}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: 'var(--text)',
                  }}>
                    {a.input_preview || '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div className="badge" style={{ background: color + '22', color }}>
                    {VERDICT_EMOJI[a.verdict]} {a.verdict}
                  </div>
                  <button
                    onClick={(e) => handleStar(e, a)}
                    style={{
                      fontSize: 18, padding: '2px 4px',
                      opacity: a.is_saved ? 1 : 0.3,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
