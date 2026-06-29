'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'

interface Stage {
  name: string
  subtitle: string
  count: string
  color: string
  drop?: string
  icon: React.ReactNode
}

interface EngineFlowProps {
  stages: Stage[]
}

export default function EngineFlow({ stages }: EngineFlowProps) {
  const router = useRouter()
  const [isCycling, setIsCycling] = useState(false)

  // Fetch real engine stats
  const { data: engineStats } = useSWR('/api/data/engine-stats', fetcher, {
    refreshInterval: 30000
  })

  if (!stages || stages.length === 0) {
    return <div className="engine-wrap">No stages data</div>
  }

  const handleCycleNow = async () => {
    if (isCycling) return

    setIsCycling(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Trigger all stages in order
      const stageNames = ['clean', 'name_enrich', 'clay_push', 'score', 'sync']

      for (const stage of stageNames) {
        const response = await fetch(`${apiUrl}/run/${stage}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          console.error(`Failed to trigger ${stage}:`, response.status)
        }
      }

      // Wait a bit then refresh the page to show updated data
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Error triggering cycle:', error)
      alert('Failed to trigger pipeline cycle. Check console for details.')
    } finally {
      setIsCycling(false)
    }
  }

  const handleHealthClick = () => {
    router.push('/dashboard/health')
  }

  const {
    throughput_24h = 0,
    spend_today = 0,
    runs_today = 0,
    ops_latency = 0,
    clay_budget = 100,
    clay_used = 0
  } = engineStats || {}

  const clayPercent = clay_budget > 0 ? Math.min((clay_used / clay_budget) * 100, 100) : 0
  const clayOverBudget = clay_used > clay_budget

  return (
    <div className="engine-wrap">
      <div className="engine-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: '6px' }}>The Engine · live</div>
          <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-.02em' }}>
            Autonomous lead refinery
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn sm ghost"
            onClick={handleCycleNow}
            disabled={isCycling}
            title="Manually trigger all pipeline stages"
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 01-9 9 9 9 0 01-8-5M3 12a9 9 0 019-9 9 9 0 018 5"/>
              <path d="M21 3v5h-5M3 21v-5h5"/>
            </svg>
            {isCycling ? 'Running...' : 'Cycle now'}
          </button>
          <button
            className="btn sm"
            onClick={handleHealthClick}
            title="View pipeline health and manual controls"
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h4l2-6 4 12 2-6h6"/>
            </svg>
            Health
          </button>
        </div>
      </div>

      <div className="engine-flow">
        {stages.map((stage, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className="epipe">
                <svg width="30" height="14">
                  <line x1="0" y1="7" x2="30" y2="7" stroke={stages[i - 1].color} strokeWidth="2" opacity=".28"/>
                  <line x1="0" y1="7" x2="30" y2="7" stroke={stages[i - 1].color} strokeWidth="2" className="flowline"/>
                </svg>
                <div className="drop">{stage.drop || ''}</div>
              </div>
            )}
            <div className="enode" style={{['--sc' as any]: stage.color}}>
              <div className="ring">
                <span className="ic">{stage.icon}</span>
              </div>
              <div className="cnt">{stage.count}</div>
              <div className="nm">
                {stage.name}
                <small>{stage.subtitle}</small>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="engine-foot">
        <div className="ef-item">
          <div className="l">Throughput · 24h</div>
          <div className="v">{throughput_24h} rows</div>
        </div>
        <div className="ef-item" style={{ flex: 1, minWidth: '210px' }}>
          <div className="l">Clay budget · today</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <div className="meter" style={{ flex: 1 }}>
              <div
                className="meter-fill"
                style={{
                  width: `${clayPercent}%`,
                  background: clayOverBudget ? 'linear-gradient(90deg, var(--bad), var(--warn))' : undefined
                }}
              ></div>
            </div>
            <span className="mono" style={{ fontSize: '12px' }}>
              <b style={{ color: clayOverBudget ? 'var(--bad)' : 'var(--accent)' }}>{clay_used}</b>/{clay_budget}
            </span>
          </div>
        </div>
        <div className="ef-item">
          <div className="l">Spend · today</div>
          <div className="v">${spend_today.toFixed(2)}</div>
        </div>
        <div className="ef-item">
          <div className="l">Runs · today</div>
          <div className="v">{runs_today}</div>
        </div>
        <div className="ef-item">
          <div className="l">ops latency</div>
          <div className="v">{ops_latency}s</div>
        </div>
      </div>
    </div>
  )
}
