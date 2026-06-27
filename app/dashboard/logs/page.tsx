'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'

// Icons (SVG components)
const Icon = {
  dollar: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 6.8s2 3 5 3.7 5 1.7 5 3.7-2.2 3.3-5 3.3-5-1.1-5-3"/>
    </svg>
  ),
  gauge: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18a8 8 0 1116 0"/>
      <path d="M12 18l4-5"/>
    </svg>
  ),
  sparkles: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/>
      <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z"/>
    </svg>
  ),
  logs: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <path d="M8 9h8M8 13h8M8 17h5"/>
    </svg>
  ),
  download: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>
    </svg>
  ),
  chev: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  )
}

// Types
interface RunError {
  domain: string
  provider: string
  code: string
  msg: string
}

interface Run {
  id: number
  stage: string
  time: string
  started_at: string
  duration: string
  rows_claimed: number
  rows_succeeded: number
  rows_failed: number
  cost: number
  triggered_by: string
  errors?: RunError[]
}

// Removed mock data - now fetching from API

// Color map
const STAGE_COLORS: Record<string, [string, string]> = {
  clean: ['#4FA0F0', 'rgba(79,160,240,.15)'],
  ready_to_enrich: ['#38BDF8', 'rgba(56,189,248,.15)'],
  name_enrich: ['#38BDF8', 'rgba(56,189,248,.15)'],
  clay_push: ['#8B7BFF', 'rgba(139,123,255,.15)'],
  clay_pending: ['#F5B13D', 'rgba(245,177,61,.15)'],
  enriched: ['#8B7BFF', 'rgba(139,123,255,.15)'],
  score: ['#5FD0C0', 'rgba(95,208,192,.15)'],
  sync: ['#22D3EE', 'rgba(34,211,238,.15)'],
  ingest: ['#5E6E83', 'rgba(94,110,131,.15)']
}

const getStageColor = (stage: string): [string, string] =>
  STAGE_COLORS[stage] || ['#9CA9BA', 'rgba(156,169,186,.14)']

// Badge component
function Badge({ label, stage }: { label: string; stage: string }) {
  const [color, bgColor] = getStageColor(stage)
  return (
    <span
      className="badge"
      style={{
        color,
        background: bgColor,
        borderColor: `color-mix(in srgb, ${color} 24%, transparent)`
      }}
    >
      <span className="d" style={{ background: color }}></span>
      {label}
    </span>
  )
}

// Mini chart components
function MiniBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '96px' }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: '4px 4px 0 0',
            background: `linear-gradient(180deg, ${color}, rgba(245,177,61,.2))`,
            height: `${(v / max) * 100}%`
          }}
          title={`$${v.toFixed(2)}`}
        />
      ))}
    </div>
  )
}

function MiniLine({ values, color }: { values: number[]; color: string }) {
  const w = 260
  const h = 96
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = (max - min) || 1

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1) * w).toFixed(1)
    const y = (h - ((v - min) / range) * (h - 12) - 6).toFixed(1)
    return `${x},${y}`
  })

  const poly = points.join(' ')
  const area = `${poly} ${w},${h} 0,${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '96px' }}>
      <polygon points={area} fill={color} opacity="0.12"/>
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

export default function RunLogPage() {
  const [expandedRun, setExpandedRun] = useState<number | null>(null)

  // Fetch real pipeline runs from API
  const { data: runsData, error } = useSWR('/api/data/recent-runs', fetcher, {
    refreshInterval: 30000 // Auto-refresh every 30 seconds
  })

  const runs: Run[] = runsData?.runs || []

  // Calculate today's total cost from runs
  const todayCost = runs.reduce((sum, run) => sum + (run.cost || 0), 0)

  // Calculate cost by stage (aggregate from all runs)
  const costByStageMap: Record<string, number> = {}
  runs.forEach(run => {
    if (!costByStageMap[run.stage]) {
      costByStageMap[run.stage] = 0
    }
    costByStageMap[run.stage] += run.cost || 0
  })

  const stageColorMap: Record<string, string> = {
    'clay_push': '#8B7BFF',
    'name_enrich': '#38BDF8',
    'clean': '#4FA0F0',
    'score': '#5FD0C0',
    'sync': '#22D3EE'
  }

  const byStage = Object.entries(costByStageMap)
    .map(([stage, cost]) => ({
      name: stage.replace(/_/g, ' '),
      cost,
      color: stageColorMap[stage] || '#9CA9BA'
    }))
    .sort((a, b) => b.cost - a.cost)

  const maxCost = Math.max(...byStage.map(s => s.cost), 0.01) // Avoid division by zero

  // For now, use mock data for daily trend (would need date-based aggregation from backend)
  const daily = [0.12, 0.08, 0.15, 0.21, 0.18, 0.09, todayCost]
  const cumulative = daily.reduce((acc: number[], val, i) => {
    acc.push((acc[i - 1] || 0) + val)
    return acc
  }, [])

  const toggleRun = (index: number) => {
    setExpandedRun(expandedRun === index ? null : index)
  }

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Execution history</div>
          <div className="h1">Run log</div>
          <div className="sub">
            Every scheduler tick and manual trigger, with cost attribution and expandable error payloads. Click a failed run to inspect.
          </div>
        </div>
        <div className="head-actions">
          <button className="btn ghost">
            {Icon.download} CSV
          </button>
        </div>
      </div>

      {/* Cost overview cards */}
      <div className="three">
        <div className="card pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="card-title" style={{ fontSize: '13px' }}>
              {Icon.dollar} Daily spend
            </div>
            <span className="mono" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent)' }}>
              ${todayCost.toFixed(2)}
            </span>
          </div>
          <MiniBars values={daily} color="#F5B13D" />
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '8px', textAlign: 'center' }}>
            last 7 days
          </div>
        </div>

        <div className="card pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="card-title" style={{ fontSize: '13px' }}>
              {Icon.gauge} Cumulative
            </div>
            <span className="mono" style={{ fontSize: '18px', fontWeight: 600 }}>
              ${cumulative[cumulative.length - 1].toFixed(2)}
            </span>
          </div>
          <MiniLine values={cumulative} color="#7C76FF" />
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '8px', textAlign: 'center' }}>
            running total · this week
          </div>
        </div>

        <div className="card pad">
          <div className="card-title" style={{ fontSize: '13px', marginBottom: '14px' }}>
            {Icon.sparkles} Cost by stage
          </div>
          {byStage.length > 0 ? (
            byStage.map((stage, i) => (
              <div key={i} className="bar-row" style={{ padding: '6px 0' }}>
                <div className="lab" style={{ width: '150px', flexBasis: '150px', fontSize: '11.5px' }}>
                  {stage.name}
                </div>
                <div className="bar-track" style={{ height: '18px' }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${stage.cost > 0 ? (stage.cost / maxCost) * 100 : 1}%`,
                      background: stage.color
                    }}
                  >
                    ${stage.cost.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
              No cost data yet
            </div>
          )}
          {byStage.length > 0 && (
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '8px' }}>
              Total cost across all stages: ${byStage.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Runs table */}
      <div className="card section-gap">
        <div className="card-head">
          <div className="card-title">{Icon.logs} Pipeline runs</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['clean', 'name_enrich', 'clay_push', 'score', 'sync'].map(stage => (
              <Badge key={stage} label={stage} stage={stage} />
            ))}
            <span style={{ width: '1px', height: '18px', background: 'var(--border)' }}></span>
            <button className="badge" style={{ cursor: 'pointer', border: '1px solid var(--border)' }}>
              failures only
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Claimed</th>
                <th>OK / Fail</th>
                <th>Cost</th>
                <th>Trigger</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    {error ? 'Error loading runs' : 'No pipeline runs yet'}
                  </td>
                </tr>
              ) : (
                runs.map((run, i) => (
                  <React.Fragment key={run.id || i}>
                    <tr
                      className={run.errors ? 'clickable' : ''}
                      onClick={() => run.errors && toggleRun(i)}
                    >
                      <td><Badge label={run.stage} stage={run.stage} /></td>
                      <td className="cell-mono cell-dim">{run.time}</td>
                      <td className="cell-mono">{run.duration}</td>
                      <td className="cell-mono">{run.rows_claimed}</td>
                      <td className="cell-mono">
                        <span style={{ color: 'var(--good)' }}>{run.rows_succeeded}</span>
                        {' / '}
                        {run.rows_failed > 0 ? (
                          <span style={{ color: 'var(--bad)' }}>{run.rows_failed}</span>
                        ) : (
                          <span className="cell-dim">0</span>
                        )}
                      </td>
                      <td className="cell-mono">
                        {run.cost > 0 ? (
                          `$${run.cost.toFixed(2)}`
                        ) : (
                          <span className="cell-dim">$0.00</span>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ fontSize: '10px' }}>
                          {run.triggered_by}
                        </span>
                      </td>
                      <td style={{ width: '24px', color: 'var(--text-faint)' }}>
                        {run.errors && Icon.chev}
                      </td>
                    </tr>
                    {run.errors && (
                      <tr className={`run-detail ${expandedRun === i ? 'open' : ''}`}>
                        <td colSpan={8}>
                          <div className="inner">
                            <div className="err-json">
                              {run.errors.map((e, j) => (
                                <div key={j}>
                                  • [{e.code}] {e.domain} → {e.provider}
                                  <br />
                                  {'  '}{e.msg}
                                  {j < run.errors!.length - 1 && <br />}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
