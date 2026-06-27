'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import KpiCard from '@/components/kpi-card'
import EngineFlow from '@/components/engine-flow'
import StageHealthCard from '@/components/stage-health-card'
import ActivityTable from '@/components/activity-table'
import { Database, Broom, Target, Beaker, Check, Cloud, Send } from '@/components/icons'
import { fetcher } from '@/lib/api'

// Fallback mock sparkline data (real API doesn't have historical data yet)
const KPIS = [
  {
    label: 'Total operators',
    value: '610',
    delta: { text: '+27', direction: 'up' as const },
    note: '7-day intake',
    color: '#4FA0F0',
    sparkline: [540, 548, 560, 566, 575, 582, 588, 595, 600, 604, 608, 610]
  },
  {
    label: 'Name coverage',
    value: '27%',
    sub: '· 165',
    delta: { text: '+4pt', direction: 'up' as const },
    note: 'target 45%',
    color: '#8B7BFF',
    sparkline: [19, 20, 21, 21, 22, 23, 24, 25, 25, 26, 26, 27]
  },
  {
    label: 'Qualified leads',
    value: '169',
    delta: { text: '54%', direction: 'flat' as const },
    note: 'of scored',
    color: '#35D399',
    sparkline: [120, 128, 134, 140, 146, 150, 155, 159, 162, 165, 167, 169]
  },
  {
    label: 'Synced → Attio',
    value: '128',
    delta: { text: '+22', direction: 'up' as const },
    note: 'handed to SDR',
    color: '#22D3EE',
    sparkline: [78, 84, 90, 98, 104, 110, 114, 118, 122, 124, 126, 128]
  },
  {
    label: 'Cost / qualified',
    value: '$0.41',
    delta: { text: '−$0.06', direction: 'up' as const },
    note: 'ceiling $1.50',
    color: '#F5B13D',
    sparkline: [0.62, 0.58, 0.55, 0.52, 0.5, 0.49, 0.47, 0.45, 0.44, 0.43, 0.42, 0.41]
  }
]

const STAGE_HEALTH = [
  { name: 'clean', status: 'ok' as const, lastRun: '2m ago', rows: '8', next: '18m', progress: 14, errors: '0', enabled: true, color: '#4FA0F0' },
  { name: 'name_enrich', status: 'ok' as const, lastRun: '11m ago', rows: '24', next: '19m', progress: 38, errors: '0', enabled: true, color: '#38BDF8' },
  { name: 'clay_push', status: 'warn' as const, lastRun: '34m ago', rows: '20', next: 'budget', progress: 92, errors: '0', enabled: true, color: '#8B7BFF', note: '80% of daily budget used' },
  { name: 'score', status: 'ok' as const, lastRun: '4m ago', rows: '46', next: '11m', progress: 26, errors: '0', enabled: true, color: '#5FD0C0' },
  { name: 'sync', status: 'warn' as const, lastRun: '1h 6m ago', rows: '0', next: 'paused', progress: 100, errors: '3', enabled: true, color: '#22D3EE', note: 'migration pending' }
]

const RECENT_RUNS = [
  { stage: 'score', time: '14:41:02', duration: '3.1s', claimed: 46, ok: 46, fail: 0, cost: 0, trigger: 'scheduler' },
  { stage: 'name_enrich', time: '14:30:18', duration: '1m 12s', claimed: 30, ok: 27, fail: 3, cost: 0.31, trigger: 'scheduler' },
  { stage: 'clay_push', time: '14:08:55', duration: '0.9s', claimed: 20, ok: 20, fail: 0, cost: 0.60, trigger: 'scheduler' },
  { stage: 'sync', time: '13:35:40', duration: '—', claimed: 0, ok: 0, fail: 3, cost: 0, trigger: 'scheduler' },
  { stage: 'clean', time: '13:30:11', duration: '22s', claimed: 100, ok: 94, fail: 6, cost: 0.01, trigger: 'scheduler' },
  { stage: 'clay_push', time: '13:08:02', duration: '1.1s', claimed: 20, ok: 19, fail: 1, cost: 0.57, trigger: 'manual' }
]

const TRENDS = [
  { label: 'Daily throughput', value: '182', unit: 'rows', color: '#4FA0F0', sparkline: [120, 140, 155, 148, 170, 165, 182] },
  { label: 'Clay success rate', value: '78%', unit: 'full+email', color: '#35D399', sparkline: [68, 70, 72, 71, 74, 76, 78] },
  { label: 'Qualification rate', value: '54%', unit: 'of scored', color: '#5FD0C0', sparkline: [48, 50, 49, 52, 53, 52, 54] },
  { label: 'Cost / qualified', value: '$0.41', unit: '', color: '#F5B13D', sparkline: [0.55, 0.52, 0.5, 0.48, 0.45, 0.43, 0.41] }
]

function Sparkline({ data, color }: { data: number[], color: string }) {
  const w = 78
  const h = 26
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = (max - min) || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1) * w).toFixed(1)
    const y = (h - ((v - min) / range) * (h - 5) - 2.5).toFixed(1)
    return `${x},${y}`
  }).join(' ')

  const lastX = w
  const lastY = (h - ((data[data.length - 1] - min) / range) * (h - 5) - 2.5).toFixed(1)

  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx={lastX} cy={lastY} r="2.2" fill={color} />
    </svg>
  )
}

export default function OverviewPage() {
  // Fetch real data from API
  const { data: kpisData, error: kpisError } = useSWR('/api/data/kpis', fetcher)
  const { data: pipelineData, error: pipelineError } = useSWR('/api/data/pipeline-counts', fetcher)
  const { data: stageHealthData } = useSWR('/api/data/stage-health', fetcher)
  const { data: recentRunsData } = useSWR('/api/data/recent-runs?limit=6', fetcher)

  // Transform API data to KPI cards format
  const KPIS = useMemo(() => {
    if (!kpisData) return []

    return [
      {
        label: 'Total operators',
        value: kpisData.total_operators?.value || '0',
        delta: { text: kpisData.total_operators?.delta || '+0', direction: kpisData.total_operators?.direction || 'flat' as const },
        note: '7-day intake',
        color: '#4FA0F0',
        sparkline: [540, 548, 560, 566, 575, 582, 588, 595, 600, 604, 608, parseInt(kpisData.total_operators?.value || '0')]
      },
      {
        label: 'Name coverage',
        value: kpisData.name_coverage?.value || '0%',
        sub: kpisData.name_coverage?.sub || '· 0',
        delta: { text: kpisData.name_coverage?.delta || '0pt', direction: kpisData.name_coverage?.direction || 'flat' as const },
        note: 'target 45%',
        color: '#8B7BFF',
        sparkline: [19, 20, 21, 21, 22, 23, 24, 25, 25, 26, 26, parseInt(kpisData.name_coverage?.value || '0')]
      },
      {
        label: 'Qualified leads',
        value: kpisData.qualified_leads?.value || '0',
        delta: { text: kpisData.qualified_leads?.delta || '0%', direction: kpisData.qualified_leads?.direction || 'flat' as const },
        note: 'of scored',
        color: '#35D399',
        sparkline: [120, 128, 134, 140, 146, 150, 155, 159, 162, 165, 167, parseInt(kpisData.qualified_leads?.value || '0')]
      },
      {
        label: 'Synced → Attio',
        value: kpisData.synced?.value || '0',
        delta: { text: kpisData.synced?.delta || '+0', direction: kpisData.synced?.direction || 'flat' as const },
        note: 'handed to SDR',
        color: '#22D3EE',
        sparkline: [78, 84, 90, 98, 104, 110, 114, 118, 122, 124, 126, parseInt(kpisData.synced?.value || '0')]
      },
      {
        label: 'Cost / qualified',
        value: kpisData.cost_per_qualified?.value || '$0.00',
        delta: { text: kpisData.cost_per_qualified?.delta || '$0.00', direction: kpisData.cost_per_qualified?.direction || 'flat' as const },
        note: 'ceiling $1.50',
        color: '#F5B13D',
        sparkline: [0.62, 0.58, 0.55, 0.52, 0.5, 0.49, 0.47, 0.45, 0.44, 0.43, 0.42, 0.41]
      }
    ]
  }, [kpisData])

  // Transform pipeline data to engine flow stages
  const STAGES = useMemo(() => {
    if (!pipelineData?.stages) {
      return []
    }

    const stages = pipelineData.stages
    const total = pipelineData.total || 0

    return [
      { name: 'Raw', subtitle: 'INGESTED', count: stages.raw?.toLocaleString() || '0', color: '#5E6E83', icon: <Database /> },
      { name: 'Cleaned', subtitle: 'LIVE · STR', count: stages.clean?.toLocaleString() || '0', color: '#4FA0F0', drop: stages.raw && stages.clean ? `−${stages.raw - stages.clean}` : '', icon: <Broom /> },
      { name: 'Enrich-ready', subtitle: 'DOMAIN OK', count: stages.ready_to_enrich?.toLocaleString() || '0', color: '#38BDF8', drop: stages.clean && stages.ready_to_enrich ? `−${stages.clean - stages.ready_to_enrich}` : '', icon: <Target /> },
      { name: 'Enriched', subtitle: 'CONTACT', count: stages.enriched?.toLocaleString() || '0', color: '#8B7BFF', drop: stages.ready_to_enrich && stages.enriched ? `−${stages.ready_to_enrich - stages.enriched}` : '', icon: <Beaker /> },
      { name: 'Qualified', subtitle: 'ICP ≥ 55', count: stages.qualified?.toLocaleString() || '0', color: '#35D399', drop: stages.enriched && stages.qualified ? `−${stages.enriched - stages.qualified}` : '', icon: <Check /> },
      { name: 'Synced', subtitle: 'IN ATTIO', count: stages.synced?.toLocaleString() || '0', color: '#22D3EE', drop: stages.qualified && stages.synced ? `−${stages.qualified - stages.synced}` : '', icon: <Cloud /> },
      { name: 'SDR Live', subtitle: 'SEQUENCING', count: stages.sdr_live?.toLocaleString() || '0', color: '#7C76FF', drop: stages.synced && stages.sdr_live ? `−${stages.synced - stages.sdr_live}` : '', icon: <Send /> }
    ]
  }, [pipelineData])

  // Loading state
  if (!kpisData || !pipelineData) {
    return (
      <div className="page active">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          Loading dashboard data...
        </div>
      </div>
    )
  }

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Mission control</div>
          <div className="h1">Overview</div>
          <div className="sub">
            Live state of the autonomous GTM pipeline — from raw STR operators to qualified, reachable leads handed to the SDR agent.
          </div>
        </div>
        <div className="head-actions">
          <button className="btn ghost">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>
            </svg>
            Export
          </button>
          <button className="btn primary">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4l14 8-14 8z"/>
            </svg>
            Run all stages
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpis">
        {KPIS.map((kpi, i) => (
          <KpiCard
            key={i}
            label={kpi.label}
            value={kpi.value}
            valueSuffix={kpi.sub}
            delta={kpi.delta}
            note={kpi.note}
            accentColor={kpi.color}
            icon={<Database />}
            sparklineData={kpi.sparkline}
          />
        ))}
      </div>

      {/* Engine Flow (includes stats in footer) */}
      <div style={{ marginTop: '16px' }}>
        <EngineFlow stages={STAGES} />
      </div>

      {/* Pipeline Stages */}
      <div className="card section-gap">
        <div className="card-head">
          <div className="card-title">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h4l2-6 4 12 2-6h6"/>
            </svg>
            Pipeline stages
          </div>
          <div className="card-meta">5 runners · APScheduler</div>
        </div>
        <div className="card-body">
          <div className="stage-strip">
            {(stageHealthData?.stages || STAGE_HEALTH).map((stage: any, i: number) => (
              <StageHealthCard key={i} {...stage} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Trends */}
      <div className="grid section-gap" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <path d="M8 9h8M8 13h8M8 17h5"/>
              </svg>
              Recent activity
            </div>
            <a className="card-meta" style={{ cursor: 'pointer', color: 'var(--brand-bright)' }}>
              View run log →
            </a>
          </div>
          <ActivityTable runs={recentRunsData?.runs || RECENT_RUNS} />
        </div>

        {/* 7-day Trends */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18a8 8 0 1116 0"/>
                <path d="M12 18l4-5"/>
              </svg>
              7-day trends
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: '6px' }}>
            {TRENDS.map((trend, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '11px 0',
                  borderBottom: i < TRENDS.length - 1 ? '1px solid var(--border-soft)' : 'none'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{trend.label}</div>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                    {trend.unit}
                  </div>
                </div>
                <div
                  className="mono"
                  style={{ fontSize: '17px', fontWeight: 600, color: trend.color }}
                >
                  {trend.value}
                </div>
                <Sparkline data={trend.sparkline} color={trend.color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
