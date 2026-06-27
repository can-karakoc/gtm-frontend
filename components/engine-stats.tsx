'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/api'

export default function EngineStats() {
  const { data, error } = useSWR('/api/data/engine-stats', fetcher, {
    refreshInterval: 30000 // Refresh every 30 seconds
  })

  if (error) {
    return (
      <div className="card pad">
        <div className="eyebrow" style={{ marginBottom: '6px' }}>The Engine</div>
        <div style={{ color: 'var(--bad)' }}>Error loading stats</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card pad">
        <div className="eyebrow" style={{ marginBottom: '6px' }}>The Engine</div>
        <div style={{ color: 'var(--text-mute)' }}>Loading...</div>
      </div>
    )
  }

  const {
    throughput_24h,
    spend_today,
    runs_today,
    ops_latency,
    clay_budget,
    clay_used
  } = data

  // Calculate Clay budget percentage
  const clayPercent = clay_budget > 0 ? Math.min((clay_used / clay_budget) * 100, 100) : 0
  const clayOverBudget = clay_used > clay_budget

  return (
    <div className="card pad">
      <div className="eyebrow" style={{ marginBottom: '6px' }}>The Engine</div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Throughput */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            THROUGHPUT · 24H
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)' }}>
            {throughput_24h} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-mute)' }}>rows</span>
          </div>
        </div>

        {/* Clay Budget */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CLAY BUDGET · TODAY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-raised)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${clayPercent}%`,
                  height: '100%',
                  background: clayOverBudget
                    ? 'linear-gradient(90deg, var(--bad), var(--warn))'
                    : 'linear-gradient(90deg, var(--brand), var(--accent))',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--mono)', minWidth: '60px' }}>
              <span style={{ color: clayOverBudget ? 'var(--bad)' : 'var(--brand)' }}>{clay_used}</span>
              <span style={{ color: 'var(--text-dim)' }}>/{clay_budget}</span>
            </div>
          </div>
        </div>

        {/* Spend */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SPEND · TODAY
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
            ${spend_today.toFixed(2)}
          </div>
        </div>

        {/* Runs */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            RUNS · TODAY
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)' }}>
            {runs_today}
          </div>
        </div>

        {/* Latency */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OPS LATENCY
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)' }}>
            {ops_latency}s
          </div>
        </div>
      </div>

      {/* Warning if over budget */}
      {clayOverBudget && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          fontSize: '11px',
          color: 'var(--bad)'
        }}>
          ⚠️ Clay budget exceeded: {clay_used}/{clay_budget} operators sent today
        </div>
      )}
    </div>
  )
}
