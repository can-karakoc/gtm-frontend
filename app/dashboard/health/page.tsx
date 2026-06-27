'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { Bell, Sparkles, Pulse, Broom, Target, Gauge, Cloud } from '@/components/icons'

interface SystemDependency {
  nm: string
  st: 'ok' | 'warn' | 'err' | 'off'
  v: string
  m: string
}

interface StageHealth {
  nm: string
  st: 'ok' | 'warn' | 'err' | 'off'
  last: string
  rows: string
  next: string
  pct: number
  err: string
  enabled: number
  note?: string
  c: string
  ic: string
}

interface Alert {
  lvl: 'err' | 'warn' | 'info'
  t: string
  d: string
  time: string
}

export default function HealthPage() {
  // Fetch stage health from API
  const { data: stageHealthData, error } = useSWR('/api/data/stage-health', fetcher, {
    refreshInterval: 30000 // Refresh every 30 seconds
  })

  // Mock data - System dependencies
  const systemDependencies: SystemDependency[] = [
    { nm: 'Pipeline service', st: 'ok', v: '3d 14h', m: 'uptime · gtm-pipeline.fly.dev' },
    { nm: 'Supabase DB', st: 'ok', v: '41ms', m: 'pooled · gfjxpibyfkxv' },
    { nm: 'Clay webhook', st: 'ok', v: '200', m: 'last receipt 34m ago' },
    { nm: 'Attio API', st: 'ok', v: '118ms', m: 'DEV Outbound workspace' }
  ]

  // Icon mapping for stages
  const iconMap: Record<string, string> = {
    'clean': 'broom',
    'name_enrich': 'target',
    'clay_push': 'sparkles',
    'score': 'gauge',
    'sync': 'cloud'
  }

  // Transform API data to match component format
  const stageHealth: StageHealth[] = stageHealthData?.stages?.map((stage: any) => ({
    nm: stage.name,
    st: stage.status as 'ok' | 'warn' | 'err' | 'off',
    last: stage.last_run,
    rows: stage.rows,
    next: stage.next,
    pct: stage.progress,
    err: stage.errors,
    enabled: stage.enabled ? 1 : 0,
    note: stage.note,
    c: stage.color,
    ic: iconMap[stage.name] || 'pulse'
  })) || []

  // Generate real alerts from stage health data
  const alerts: Alert[] = []

  if (stageHealth && stageHealth.length > 0) {
    stageHealth.forEach(stage => {
      const queueSize = parseInt(stage.rows) || 0
      const errorCount = parseInt(stage.err) || 0

      // Alert: Large queue backlog
      if (queueSize >= 500) {
        alerts.push({
          lvl: 'warn',
          t: `${stage.nm} has large backlog`,
          d: `${queueSize.toLocaleString()} operators queued. Consider running the ${stage.nm} stage manually.`,
          time: stage.last
        })
      }

      // Alert: Stage errors
      if (errorCount > 0) {
        alerts.push({
          lvl: 'err',
          t: `${stage.nm} stage failing`,
          d: `${errorCount} error(s) in last run. Check logs for details.`,
          time: stage.last
        })
      }
    })

    // Alert: Scheduler status
    if (stageHealth[0]?.next === 'manual') {
      alerts.push({
        lvl: 'info',
        t: 'Pipeline scheduler is off',
        d: 'All stages are set to manual triggering. Operators will not be processed automatically.',
        time: 'now'
      })
    }
  }

  // If no alerts, show a healthy status
  if (alerts.length === 0) {
    alerts.push({
      lvl: 'info',
      t: 'All systems operational',
      d: 'No issues detected. Pipeline is running smoothly.',
      time: 'now'
    })
  }

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      broom: Broom,
      target: Target,
      sparkles: Sparkles,
      gauge: Gauge,
      cloud: Cloud
    }
    return icons[iconName] || Pulse
  }

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Diagnostics</div>
          <div className="h1">Health</div>
          <div className="sub">
            Per-stage liveness, system dependencies, and the alert feed — built to answer "what stalled, why, and what is queued behind it."
          </div>
        </div>
      </div>

      {/* System dependencies */}
      <div className="fr-title" style={{ marginBottom: '10px' }}>
        System dependencies
      </div>
      <div className="sys-grid">
        {systemDependencies.map((sys, idx) => (
          <div key={idx} className="sys-card">
            <div className="sh">
              <span className={`st ${sys.st}`}></span>
              <span className="nm">{sys.nm}</span>
            </div>
            <div className="sv">{sys.v}</div>
            <div className="sm">{sys.m}</div>
          </div>
        ))}
      </div>

      {/* Stage health */}
      <div className="fr-title" style={{ margin: '22px 0 10px' }}>
        Stage health
      </div>
      <div className="hc-grid">
        {stageHealth.map((stage, idx) => {
          const IconComponent = getIcon(stage.ic)
          return (
            <div
              key={idx}
              className="hcard"
              style={{ '--sc': stage.c } as React.CSSProperties}
            >
              <div className="hh">
                <IconComponent className="ic" style={{ width: '16px', height: '16px' }} />
                <span className="nm">{stage.nm}</span>
                <span className={`st ${stage.st}`} style={{ marginLeft: 'auto' }}></span>
              </div>
              <div className="hm">
                <span>last run</span>
                <b>{stage.last}</b>
              </div>
              <div className="hm">
                <span>queued</span>
                <b style={{ color: parseInt(stage.rows) > 500 ? 'var(--warn)' : 'var(--text)' }}>
                  {stage.rows}
                </b>
              </div>
              <div className="hm">
                <span>next run</span>
                <b>{stage.next}</b>
              </div>
              <div className="hm">
                <span>errors</span>
                <b style={{ color: stage.err === '0' ? 'var(--good)' : 'var(--bad)' }}>
                  {stage.err}
                </b>
              </div>
              {stage.note && (
                <div
                  style={{
                    marginTop: '11px',
                    fontSize: '11px',
                    color: 'var(--accent)',
                    fontFamily: 'var(--mono)',
                    lineHeight: '1.4'
                  }}
                >
                  ⚠ {stage.note}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Alerts */}
      <div className="card section-gap">
        <div className="card-head">
          <div className="card-title">
            <Bell className="ic" style={{ width: '16px', height: '16px' }} />
            Alerts
          </div>
          <div className="card-meta">
            {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} ·
            {alerts.filter(a => a.lvl === 'err' || a.lvl === 'warn').length} active
          </div>
        </div>
        <div>
          {alerts.map((alert, idx) => (
            <div key={idx} className="alert-item">
              <div className={`alert-ic ${alert.lvl}`}>
                {alert.lvl === 'err' && (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l9 16H3z" />
                    <path d="M12 9v5M12 17h.01" />
                  </svg>
                )}
                {alert.lvl === 'warn' && (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
                  </svg>
                )}
                {alert.lvl === 'info' && (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                  </svg>
                )}
              </div>
              <div className="alert-body">
                <div className="at">{alert.t}</div>
                <div className="ad">{alert.d}</div>
              </div>
              <div className="alert-time">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
