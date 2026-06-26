'use client'

import { useState } from 'react'

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
  stage: string
  t: string
  dur: string
  cl: number
  ok: number
  fail: number
  cost: number
  trig: string
  err?: RunError[]
  meta?: string
}

// Mock data
const RUNS: Run[] = [
  {stage:'score', t:'14:41:02', dur:'3.1s', cl:46, ok:46, fail:0, cost:0, trig:'scheduler'},
  {stage:'name_enrich', t:'14:30:18', dur:'1m 12s', cl:30, ok:27, fail:3, cost:0.31, trig:'scheduler', err:[
    {domain:'casa-marbella.es', provider:'snov_domain_search', code:'RATE_LIMIT', msg:'429 — credit window exhausted, retry in 600s'},
    {domain:'lakeside-cabins.co', provider:'website_scrape', code:'TIMEOUT', msg:'fetch exceeded 8s'},
    {domain:'urbanstaysptl.com', provider:'prospeo', code:'NO_MATCH', msg:'no contact for domain'}
  ]},
  {stage:'clay_push', t:'14:08:55', dur:'0.9s', cl:20, ok:20, fail:0, cost:0.60, trig:'scheduler'},
  {stage:'sync', t:'13:35:40', dur:'—', cl:0, ok:0, fail:3, cost:0, trig:'scheduler', err:[
    {domain:'(all)', provider:'attio_sync', code:'SCHEMA_MISSING', msg:'column attio_list_entry_id not found — apply pending migration before sync'}
  ]},
  {stage:'clean', t:'13:30:11', dur:'22s', cl:100, ok:94, fail:6, cost:0.01, trig:'scheduler'},
  {stage:'clay_push', t:'13:08:02', dur:'1.1s', cl:20, ok:19, fail:1, cost:0.57, trig:'manual'},
  {stage:'score', t:'12:56:30', dur:'2.8s', cl:52, ok:52, fail:0, cost:0, trig:'scheduler'},
  {stage:'name_enrich', t:'12:30:44', dur:'1m 30s', cl:30, ok:28, fail:2, cost:0.34, trig:'scheduler'},
  {stage:'clean', t:'12:10:09', dur:'19s', cl:100, ok:97, fail:3, cost:0.01, trig:'scheduler'},
  {stage:'ingest', t:'11:42:55', dur:'8.4s', cl:312, ok:283, fail:0, cost:0, trig:'manual', meta:'29 duplicates skipped'}
]

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

  // Daily spend data
  const daily = [1.9, 2.4, 2.1, 2.8, 3.1, 2.6, 2.34]
  const cumulative = daily.reduce((acc: number[], val, i) => {
    acc.push((acc[i - 1] || 0) + val)
    return acc
  }, [])

  // Cost by stage
  const byStage = [
    { name: 'Clay enrichment', cost: 10.80, color: '#8B7BFF' },
    { name: 'Name enrich (Snov/scrape)', cost: 6.40, color: '#38BDF8' },
    { name: 'Clean (LLM)', cost: 0.30, color: '#4FA0F0' },
    { name: 'Score', cost: 0, color: '#5FD0C0' },
    { name: 'Sync', cost: 0, color: '#22D3EE' }
  ]
  const maxCost = Math.max(...byStage.map(s => s.cost))

  const toggleRun = (index: number) => {
    setExpandedRun(expandedRun === index ? null : index)
  }

  return (
    <div className="page">
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
              $2.34
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
          {byStage.map((stage, i) => (
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
          ))}
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '8px' }}>
            Clay is 62% of spend — the lever to watch.
          </div>
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
              {RUNS.map((run, i) => (
                <>
                  <tr
                    key={i}
                    className={run.err ? 'clickable' : ''}
                    onClick={() => run.err && toggleRun(i)}
                  >
                    <td><Badge label={run.stage} stage={run.stage} /></td>
                    <td className="cell-mono cell-dim">{run.t}</td>
                    <td className="cell-mono">{run.dur}</td>
                    <td className="cell-mono">{run.cl}</td>
                    <td className="cell-mono">
                      <span style={{ color: 'var(--good)' }}>{run.ok}</span>
                      {' / '}
                      {run.fail > 0 ? (
                        <span style={{ color: 'var(--bad)' }}>{run.fail}</span>
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
                        {run.trig}
                      </span>
                    </td>
                    <td style={{ width: '24px', color: 'var(--text-faint)' }}>
                      {run.err && Icon.chev}
                    </td>
                  </tr>
                  {run.err && (
                    <tr className={`run-detail ${expandedRun === i ? 'open' : ''}`}>
                      <td colSpan={8}>
                        <div className="inner">
                          <div className="err-json">
                            {run.err.map((e, j) => (
                              <div key={j}>
                                • [{e.code}] {e.domain} → {e.provider}
                                <br />
                                {'  '}{e.msg}
                                {j < run.err!.length - 1 && <br />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
