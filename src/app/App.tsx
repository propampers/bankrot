import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { BottomNav } from '@/shared/ui/BottomNav'
import Dashboard from '@/pages/Dashboard'
import AnalysisDetail from '@/pages/AnalysisDetail'
import BeneficiaryGraph from '@/pages/BeneficiaryGraph'
import Stats from '@/pages/Stats'

export default function App() {
  useEffect(() => {
    window.Telegram?.WebApp?.expand()
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
        <Route path="/graph/:id" element={<BeneficiaryGraph />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
      <BottomNav />
    </>
  )
}
