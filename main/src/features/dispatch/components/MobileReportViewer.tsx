"use client"

import { useEffect, useState } from 'react'
import {
  getMobileDispatchReportAction,
  type MobileDispatchReport,
} from '@/lib/actions/dispatch'

interface Props {
  orgId: number
}

export default function MobileReportViewer({ orgId }: Props) {
  const [report, setReport] = useState<MobileDispatchReport | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('dispatchMobileReport')
    if (stored) setReport(JSON.parse(stored))
    async function load() {
      try {
        const data = await getMobileDispatchReportAction({ orgId })
        setReport(data)
        localStorage.setItem('dispatchMobileReport', JSON.stringify(data))
      } catch (err) {
        console.error('report load error', err)
      }
    }
    if (navigator.onLine) load()
  }, [orgId])

  const handleShare = async () => {
    if (!report) return
    const text = JSON.stringify(report, null, 2)
    if (navigator.share) {
      await navigator.share({ text })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      alert('Report copied to clipboard')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!report) return <div>Loading...</div>

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <button onClick={handleShare} className="border px-2 py-1 rounded">
          Share
        </button>
        <button onClick={handlePrint} className="border px-2 py-1 rounded">
          Print
        </button>
      </div>
      <div className="text-xs">Fetched {new Date(report.fetchedAt).toLocaleString()}</div>
      <div className="space-y-1 text-sm">
        <div>Active Loads: {report.kpis.activeLoads}</div>
        <div>Completed Loads: {report.kpis.completedLoads}</div>
        <div>On-Time Rate: {(report.kpis.onTimeRate * 100).toFixed(0)}%</div>
        <div>Exception Rate: {(report.kpis.exceptionRate * 100).toFixed(0)}%</div>
      </div>
    </div>
  )
}
