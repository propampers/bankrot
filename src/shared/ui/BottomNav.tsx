import { useNavigate, useLocation } from 'react-router-dom'

export function BottomNav() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const active = (p: string) => pathname === p ? 'nav-item active' : 'nav-item'

  return (
    <nav className="bottom-nav">
      <button className={active('/')} onClick={() => nav('/')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        Анализы
      </button>
      <button className={active('/stats')} onClick={() => nav('/stats')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        Статистика
      </button>
    </nav>
  )
}
