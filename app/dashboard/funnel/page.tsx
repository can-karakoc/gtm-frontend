'use client'

import Badge from '@/components/badge'
import ChartDonut from '@/components/chart-donut'
import Histogram from '@/components/histogram'
import { Beaker, Gauge, User, Target, Funnel, Bolt } from '@/components/icons'

// Mock data - matches gtm-engine-dashboard.html pageFunnel()
const TIERS = [
  { k: 'clay_full', n: 96, p: '30.8%', sc: 79, sync: '71%' },
  { k: 'clay_email', n: 121, p: '38.8%', sc: 66, sync: '52%' },
  { k: 'clay_phone', n: 44, p: '14.1%', sc: 58, sync: '23%' },
  { k: 'clay_linkedin', n: 28, p: '9.0%', sc: 49, sync: '11%' },
  { k: 'clay_no_data', n: 23, p: '7.4%', sc: 34, sync: '4%' },
]

const STATUS_DIST = [
  { k: 'synced', n: 128 },
  { k: 'qualified', n: 41 },
  { k: 'disqualified', n: 96 },
  { k: 'enriched', n: 18 },
  { k: 'clay_sent', n: 24 },
  { k: 'clay_pending', n: 38 },
  { k: 'ready_to_enrich', n: 73 },
  { k: 'no_custom_domain', n: 52 },
  { k: 'publicly_reachable_only', n: 31 },
  { k: 'no_public_contact', n: 18 },
  { k: 'needs_review', n: 9 },
  { k: 'dead', n: 44 },
  { k: 'not_str', n: 29 },
  { k: 'churned', n: 12 },
]

const HIST = [4, 9, 14, 22, 31, 48, 61, 54, 39, 14]

const NAME_SRC = [
  { l: 'website', v: 78, c: '#4FA0F0' },
  { l: 'email_name', v: 41, c: '#22D3EE' },
  { l: 'snov', v: 32, c: '#38BDF8' },
  { l: 'leadmagic', v: 9, c: '#35D399' },
  { l: 'clay', v: 5, c: '#8B7BFF' },
]

const REACH = { yy: 84, yn: 133, ny: 26, nn: 69 }

// Color mapping for tier badges
const tierColorMap: Record<string, [string, string]> = {
  clay_full: ['#35D399', 'rgba(53,211,153,.15)'],
  clay_email: ['#22D3EE', 'rgba(34,211,238,.15)'],
  clay_phone: ['#F5B13D', 'rgba(245,177,61,.15)'],
  clay_linkedin: ['#4FA0F0', 'rgba(79,160,240,.15)'],
  clay_no_data: ['#FB6F84', 'rgba(251,111,132,.15)'],
}

const statusColorMap: Record<string, [string, string]> = {
  synced: ['#22D3EE', 'rgba(34,211,238,.15)'],
  qualified: ['#35D399', 'rgba(53,211,153,.15)'],
  disqualified: ['#FB6F84', 'rgba(251,111,132,.15)'],
  enriched: ['#8B7BFF', 'rgba(139,123,255,.15)'],
  clay_sent: ['#F59E3D', 'rgba(245,158,61,.15)'],
  clay_pending: ['#F5B13D', 'rgba(245,177,61,.15)'],
  ready_to_enrich: ['#38BDF8', 'rgba(56,189,248,.15)'],
  no_custom_domain: ['#5E6E83', 'rgba(94,110,131,.15)'],
  publicly_reachable_only: ['#38BDF8', 'rgba(56,189,248,.15)'],
  no_public_contact: ['#FB6F84', 'rgba(251,111,132,.15)'],
  needs_review: ['#F5B13D', 'rgba(245,177,61,.15)'],
  dead: ['#5E6E83', 'rgba(94,110,131,.15)'],
  not_str: ['#5E6E83', 'rgba(94,110,131,.15)'],
  churned: ['#FB6F84', 'rgba(251,111,132,.15)'],
}

export default function FunnelPage() {
  // Prepare tier segments for donut chart
  const tierSegs = TIERS.map((t) => ({ v: t.n, c: tierColorMap[t.k][0] }))
  const totalEnriched = TIERS.reduce((sum, t) => sum + t.n, 0)

  // Prepare name source segments for donut chart
  const nameSegs = NAME_SRC.map((s) => ({ v: s.v, c: s.c }))
  const nameTot = NAME_SRC.reduce((sum, s) => sum + s.v, 0)

  // Calculate confidence distribution (mock data from HTML)
  const conf = [
    { label: 'high', count: 121, color: '#35D399' },
    { label: 'medium', count: 33, color: '#F5B13D' },
    { label: 'low', count: 11, color: '#FB6F84' },
  ]
  const confTotal = 165

  // Calculate status distribution max for bar chart
  const maxStatusN = Math.max(...STATUS_DIST.map((s) => s.n))
  const totalOperators = 610

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
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div className="legend" style={{ flexDirection: 'column', gap: '8px' }}>
                  {TIERS.map((t) => (
                    <div key={t.k} className="li">
                      <span className="sw" style={{ background: tierColorMap[t.k][0] }}></span>
                      {t.k.replace(/_/g, ' ')}
                      <span className="va">{t.n}</span>
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
                {TIERS.map((t) => (
                  <tr key={t.k}>
                    <td>
                      <Badge label={t.k} status={t.k} />
                    </td>
                    <td className="cell-mono cell-strong">{t.n}</td>
                    <td className="cell-mono cell-dim">{t.p}</td>
                    <td className="cell-mono">{t.sc}</td>
                    <td className="cell-mono">{t.sync}</td>
                  </tr>
                ))}
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
            <Histogram values={HIST} qualifyThreshold={5} />
            <div
              className="muted"
              style={{ fontSize: '12px', marginTop: '14px', textAlign: 'center' }}
            >
              ICP score · 0–100 · bins of 10 —{' '}
              <span style={{ color: 'var(--good)' }}>green</span> bins clear the
              qualification gate
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
                <div className="n mono">{REACH.yy}</div>
                <div className="l">email + phone</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  27% · best
                </div>
              </div>
              <div className="mx-cell">
                <div className="n mono">{REACH.yn}</div>
                <div className="l">email only</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  43%
                </div>
              </div>

              <div className="mx-axis v">Email ✗</div>
              <div className="mx-cell">
                <div className="n mono">{REACH.ny}</div>
                <div className="l">phone only</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  8%
                </div>
              </div>
              <div
                className="mx-cell"
                style={{
                  borderColor: 'rgba(251,111,132,.35)',
                  background: 'var(--bad-bg)',
                }}
              >
                <div className="n mono">{REACH.nn}</div>
                <div className="l">public fallback</div>
                <div className="pc mono" style={{ color: 'var(--text-mute)' }}>
                  22%
                </div>
              </div>
            </div>
            <div className="warn-box" style={{ marginTop: '18px' }}>
              <Bolt />
              <div>
                <b>{REACH.nn} operators are public-email only.</b> Multi-channel
                (email + phone) leads convert ~2× — prioritise the {REACH.yy} in the
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
          {STATUS_DIST.map((s) => {
            const [color] = statusColorMap[s.k] || ['#9CA9BA', 'rgba(156,169,186,.14)']
            return (
              <div key={s.k} className="bar-row">
                <div className="lab">
                  <Badge label={s.k} status={s.k} />
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
                </div>
                <div className="pct">{((s.n / totalOperators) * 100).toFixed(1)}%</div>
              </div>
            )
          })}
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
          overflow: hidden;
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
