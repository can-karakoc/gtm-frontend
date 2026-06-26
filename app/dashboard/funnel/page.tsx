'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Badge from '@/components/badge'
import ChartDonut from '@/components/chart-donut'
import Histogram from '@/components/histogram'
import { Beaker, Gauge, User, Target, Funnel, Bolt } from '@/components/icons'
import { fetcher } from '@/lib/api'

// Custom labels for enrichment tiers (matching operators page)
const TIER_LABELS: Record<string, string> = {
  'publicly_reachable_only': 'only public info',
  'pre_enriched': 'pre enriched',
  'clay_enriched': 'clay enriched',
  'name_missing': 'name missing',
  'no_data': 'no data',
  'no_public_contact': 'no public contact',
  'clay_no_data': 'clay no data',
  'name_found': 'name found',
  'skipped_pms_host': 'skipped pms host',
}

// Tier colors (matching badge component)
const tierColorMap: Record<string, string> = {
  'pre_enriched': '#35D399',
  'clay_enriched': '#8B7BFF',
  'name_missing': '#F59E0B',
  'no_data': '#5E6E83',
  'publicly_reachable_only': '#38BDF8',
  'no_public_contact': '#FB6F84',
  'clay_no_data': '#FB6F84',
  'name_found': '#35D399',
  'skipped_pms_host': '#5E6E83',
}

// Status colors
const statusColorMap: Record<string, string> = {
  synced: '#22D3EE',
  qualified: '#35D399',
  disqualified: '#FB6F84',
  enriched: '#8B7BFF',
  clay_sent: '#F59E3D',
  clay_pending: '#F5B13D',
  ready_to_enrich: '#38BDF8',
  no_custom_domain: '#5E6E83',
  publicly_reachable_only: '#38BDF8',
  no_public_contact: '#FB6F84',
  needs_review: '#F5B13D',
  dead: '#5E6E83',
  not_str: '#5E6E83',
  churned: '#F59E0B',
  promoted: '#35D399',
  raw: '#5E6E83',
  clean: '#4FA0F0',
  scored: '#5FD0C0',
}

// Status descriptions
const STATUS_INFO: Record<string, string> = {
  'promoted': 'Active STR operators using PMS - primary targets',
  'churned': 'Former operators with expired subscriptions - win-back opportunities',
  'not_str': 'Not short-term rental businesses - exclude from outreach',
  'needs_review': 'Ambiguous cases requiring manual validation',
  'dead': 'Invalid/broken records - data quality issue',
  'synced': 'Successfully synced to Attio CRM',
  'qualified': 'Passed ICP scoring threshold (≥55)',
  'disqualified': 'Below ICP threshold - low priority',
  'enriched': 'Enrichment complete, awaiting scoring',
  'clay_sent': 'Sent to Clay for enrichment',
  'clay_pending': 'Pending Clay enrichment response',
  'ready_to_enrich': 'Cleaned and ready for enrichment',
  'no_custom_domain': 'Using PMS subdomain - cannot verify',
  'publicly_reachable_only': 'Only public contact info available',
  'no_public_contact': 'No public contact found',
  'raw': 'Newly ingested, not processed',
  'clean': 'Validated and cleaned',
  'scored': 'ICP scored, awaiting qualification',
}

export default function FunnelPage() {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)

  // Fetch funnel data from API
  const { data: tierData } = useSWR('/api/data/funnel/enrichment-tiers', fetcher)
  const { data: scoreData } = useSWR('/api/data/funnel/score-distribution', fetcher)
  const { data: reachData } = useSWR('/api/data/funnel/reachability-matrix', fetcher)
  const { data: statusCounts } = useSWR('/api/data/status-counts', fetcher)

  const tiers = tierData?.tiers || []
  const totalEnriched = tierData?.total || 0

  const scoreBins = scoreData?.bins || []
  const qualifyThreshold = scoreData?.qualify_threshold || 55

  const reach = {
    yy: reachData?.email_phone || 0,
    yn: reachData?.email_only || 0,
    ny: reachData?.phone_only || 0,
    nn: reachData?.neither || 0,
  }
  const reachPercentages = reachData?.percentages || {}

  // Status distribution
  const statusDist = statusCounts
    ? Object.entries(statusCounts).map(([k, n]) => ({ k, n: n as number }))
    : []
  const maxStatusN = statusDist.length > 0 ? Math.max(...statusDist.map((s) => s.n)) : 1
  const totalOperators = statusDist.reduce((sum, s) => sum + s.n, 0)

  // Prepare tier segments for donut chart
  const tierSegs = tiers.map((t: any) => ({
    value: t.count,
    color: tierColorMap[t.tier] || '#9CA9BA'
  }))

  // Mock name source data (TODO: add API endpoint when name_source tracking is added)
  const NAME_SRC = [
    { l: 'website', v: 78, c: '#4FA0F0' },
    { l: 'email_name', v: 41, c: '#22D3EE' },
    { l: 'snov', v: 32, c: '#38BDF8' },
    { l: 'leadmagic', v: 9, c: '#35D399' },
    { l: 'clay', v: 5, c: '#8B7BFF' },
  ]
  const nameSegs = NAME_SRC.map((s) => ({ value: s.v, color: s.c }))
  const nameTot = NAME_SRC.reduce((sum, s) => sum + s.v, 0)

  // Mock confidence data (TODO: add API endpoint)
  const conf = [
    { label: 'high', count: 121, color: '#35D399' },
    { label: 'medium', count: 33, color: '#F5B13D' },
    { label: 'low', count: 11, color: '#FB6F84' },
  ]
  const confTotal = 165

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Conversion analytics</div>
          <div className="h1">Funnel</div>
          <div className="sub">
            Where leads convert and where they drop — enrichment quality, ICP
            scoring, reachability, and the full status distribution across{' '}
            {totalOperators} operators.
          </div>
        </div>
      </div>

      {/* Enrichment Quality Tiers & Score Distribution */}
      <div className="two">
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Beaker />
              Enrichment quality tiers
            </div>
            <div className="card-meta">{totalEnriched} enriched</div>
          </div>
          <div className="card-body">
            <div className="donut-wrap">
              <div className="donut">
                <ChartDonut segments={tierSegs} size={168} />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div className="legend legend-grid">
                  {tiers.map((t: any) => (
                    <div key={t.tier} className="li">
                      <span className="sw" style={{ background: tierColorMap[t.tier] || '#9CA9BA' }}></span>
                      {TIER_LABELS[t.tier] || t.tier.replace(/_/g, ' ')}
                      <span className="va">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Count</th>
                  <th>%</th>
                  <th>Avg score</th>
                  <th>Sync rate</th>
                </tr>
              </thead>
              <tbody>
                {tiers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                      Loading...
                    </td>
                  </tr>
                ) : (
                  tiers.map((t: any) => (
                    <tr key={t.tier}>
                      <td>
                        <Badge label={TIER_LABELS[t.tier] || t.tier.replace(/_/g, ' ')} statusKey={t.tier} />
                      </td>
                      <td className="cell-mono cell-strong">{t.count}</td>
                      <td className="cell-mono cell-dim">{t.percentage}%</td>
                      <td className="cell-mono">{t.avg_score}</td>
                      <td className="cell-mono">{t.sync_rate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Gauge />
              Score distribution
            </div>
            <div className="card-meta">qualify ≥ 55</div>
          </div>
          <div className="card-body">
            <Histogram values={scoreBins} qualifyThreshold={Math.floor(qualifyThreshold / 10)} />
            <div
              className="muted"
              style={{ fontSize: '12px', marginTop: '14px', textAlign: 'center' }}
            >
              ICP score · 0–100 · bins of 10 —{' '}
              <span style={{ color: 'var(--good)' }}>green</span> bins clear the
              qualification gate (≥{qualifyThreshold})
            </div>
          </div>
        </div>
      </div>

      {/* Name Source & Reachability Matrix */}
      <div className="two section-gap">
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <User />
              Name source &amp; confidence
            </div>
            <div className="card-meta">{confTotal} named</div>
          </div>
          <div className="card-body">
            <div className="donut-wrap" style={{ marginBottom: '16px' }}>
              <div className="donut">
                <ChartDonut segments={nameSegs} size={134} />
                <div className="center" style={{ inset: '24px' }}>
                  <div className="big mono" style={{ fontSize: '18px' }}>
                    {nameTot}
                  </div>
                  <div className="lab">named</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div className="legend" style={{ flexDirection: 'column', gap: '7px' }}>
                  {NAME_SRC.map((s) => (
                    <div key={s.l} className="li">
                      <span className="sw" style={{ background: s.c }}></span>
                      {s.l}
                      <span className="va">{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="fr-title">Confidence</div>
            {conf.map((c) => (
              <div key={c.label} className="bar-row">
                <div className="lab">{c.label}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(c.count / confTotal) * 100}%`,
                      background: c.color,
                    }}
                  >
                    {c.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Target />
              Reachability matrix
            </div>
            <div className="card-meta">of {totalEnriched} enriched</div>
          </div>
          <div className="card-body">
            <div className="matrix">
              <div></div>
              <div className="mx-axis">Phone ✓</div>
              <div className="mx-axis">Phone ✗</div>

              <div className="mx-axis v">Email ✓</div>
              <div
                className="mx-cell"
                style={{
                  borderColor: 'rgba(53,211,153,.4)',
                  background: 'var(--good-bg)',
                }}
              >
                <div className="n mono">{reach.yy}</div>
                <div className="l">email + phone</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  {reachPercentages.email_phone}% · best
                </div>
              </div>
              <div className="mx-cell">
                <div className="n mono">{reach.yn}</div>
                <div className="l">email only</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  {reachPercentages.email_only}%
                </div>
              </div>

              <div className="mx-axis v">Email ✗</div>
              <div className="mx-cell">
                <div className="n mono">{reach.ny}</div>
                <div className="l">phone only</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  {reachPercentages.phone_only}%
                </div>
              </div>
              <div
                className="mx-cell"
                style={{
                  borderColor: 'rgba(251,111,132,.35)',
                  background: 'var(--bad-bg)',
                }}
              >
                <div className="n mono">{reach.nn}</div>
                <div className="l">public fallback</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  {reachPercentages.neither}%
                </div>
              </div>
            </div>
            <div className="warn-box" style={{ marginTop: '18px' }}>
              <Bolt />
              <div>
                <b>{reach.nn} operators are public-email only.</b> Multi-channel
                (email + phone) leads convert ~2× — prioritise the {reach.yy} in the
                top-left quadrant for the SDR agent.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card section-gap">
        <div className="card-head">
          <div className="card-title">
            <Funnel />
            Status distribution
          </div>
          <div className="card-meta">{totalOperators} operators · live snapshot</div>
        </div>
        <div className="card-body">
          {statusDist.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
              Loading status distribution...
            </div>
          ) : (
            statusDist.map((s) => {
              const color = statusColorMap[s.k] || '#9CA9BA'
              const percentage = ((s.n / totalOperators) * 100).toFixed(1)
              return (
                <div
                  key={s.k}
                  className="bar-row interactive"
                  onMouseEnter={() => setHoveredStatus(s.k)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <div className="lab">
                    <Badge label={s.k.replace(/_/g, ' ')} statusKey={s.k} />
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(s.n / maxStatusN) * 100}%`,
                        background: color,
                      }}
                    >
                      {s.n}
                    </div>
                    {hoveredStatus === s.k && STATUS_INFO[s.k] && (
                      <div className="bar-tooltip">
                        <div className="tooltip-title">
                          {s.k.replace(/_/g, ' ')}
                        </div>
                        <div className="tooltip-stats">
                          <span><strong>{s.n}</strong> operators</span>
                          <span><strong>{percentage}%</strong> of total</span>
                        </div>
                        <div className="tooltip-desc">
                          {STATUS_INFO[s.k]}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pct">{percentage}%</div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .two {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .section-gap {
          margin-top: 16px;
        }

        .donut-wrap {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .donut {
          position: relative;
          flex: 0 0 168px;
        }

        .donut .center {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          text-align: center;
        }

        .donut .center .big {
          font-family: var(--mono);
          font-size: 24px;
          font-weight: 600;
        }

        .donut .center .lab {
          font-size: 10px;
          color: var(--text-mute);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--mono);
        }

        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 14px;
          margin-top: 6px;
        }

        .legend-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .legend .li {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-dim);
        }

        .legend .sw {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }

        .legend .va {
          font-family: var(--mono);
          color: var(--text);
          margin-left: 2px;
        }

        .fr-title {
          font-family: var(--mono);
          font-size: 9.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-mute);
          margin-bottom: 10px;
        }

        .bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 7px 0;
          transition: opacity var(--fast);
        }

        .bar-row.interactive {
          cursor: pointer;
        }

        .bar-row.interactive:hover {
          opacity: 1;
        }

        .bar-row.interactive:hover .bar-fill {
          filter: brightness(1.15);
        }

        .bar-row .lab {
          width: 120px;
          font-size: 12px;
          color: var(--text-dim);
          text-align: right;
          flex: 0 0 120px;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }

        .bar-track {
          flex: 1;
          height: 22px;
          background: var(--surface-3);
          border-radius: var(--r-xs);
          overflow: visible;
          position: relative;
        }

        .bar-fill {
          height: 100%;
          border-radius: var(--r-xs);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          font-family: var(--mono);
          font-size: 11px;
          color: #0b0f14;
          font-weight: 600;
          min-width: 24px;
          transition: width 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .bar-row .pct {
          width: 48px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-mute);
          flex: 0 0 48px;
        }

        .bar-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 12px;
          background: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          padding: 12px 14px;
          min-width: 280px;
          max-width: 340px;
          box-shadow: 0 8px 24px -8px rgba(0,0,0,.6);
          z-index: 100;
          animation: tooltip-in 0.15s ease;
          pointer-events: none;
        }

        @keyframes tooltip-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .bar-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--border-strong);
        }

        .tooltip-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text);
          margin-bottom: 8px;
          text-transform: capitalize;
        }

        .tooltip-stats {
          display: flex;
          gap: 16px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-dim);
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-soft);
        }

        .tooltip-stats strong {
          color: var(--text);
          font-weight: 600;
        }

        .tooltip-desc {
          font-size: 12px;
          color: var(--text-mute);
          line-height: 1.5;
        }

        .matrix {
          display: grid;
          grid-template-columns: auto 1fr 1fr;
          grid-template-rows: auto 1fr 1fr;
          gap: 8px;
          max-width: 520px;
        }

        .mx-cell {
          border-radius: var(--r-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .mx-cell .n {
          font-family: var(--mono);
          font-size: 24px;
          font-weight: 600;
        }

        .mx-cell .l {
          font-size: 11px;
          color: var(--text-mute);
          margin-top: 3px;
        }

        .mx-cell .pc {
          font-family: var(--mono);
          font-size: 11px;
          margin-top: 6px;
        }

        .mx-axis {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-mute);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          text-align: center;
        }

        .mx-axis.v {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        .warn-box {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          border-radius: var(--r-sm);
          background: var(--accent-soft);
          border: 1px solid rgba(245, 177, 61, 0.3);
          font-size: 12.5px;
          color: #f5cd8a;
          margin-top: 14px;
        }

        .muted {
          color: var(--text-mute);
        }

        @media (max-width: 1024px) {
          .two {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
