import React from 'react'

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
  if (!stages || stages.length === 0) {
    return <div className="engine-wrap">No stages data</div>
  }

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
          <button className="btn sm ghost">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 01-9 9 9 9 0 01-8-5M3 12a9 9 0 019-9 9 9 0 018 5"/>
              <path d="M21 3v5h-5M3 21v-5h5"/>
            </svg>
            Cycle now
          </button>
          <button className="btn sm">
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
          <div className="v">182 rows</div>
        </div>
        <div className="ef-item" style={{ flex: 1, minWidth: '210px' }}>
          <div className="l">Clay budget · today</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <div className="meter" style={{ flex: 1 }}>
              <div className="meter-fill" style={{ width: '62%' }}></div>
            </div>
            <span className="mono" style={{ fontSize: '12px' }}>
              <b style={{ color: 'var(--accent)' }}>62</b>/100
            </span>
          </div>
        </div>
        <div className="ef-item">
          <div className="l">Spend · today</div>
          <div className="v">$2.34</div>
        </div>
        <div className="ef-item">
          <div className="l">Runs · today</div>
          <div className="v">37</div>
        </div>
        <div className="ef-item">
          <div className="l">p95 latency</div>
          <div className="v">1.4s</div>
        </div>
      </div>
    </div>
  )
}
