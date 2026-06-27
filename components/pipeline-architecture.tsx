import React from 'react'

export default function PipelineArchitecture() {
  const stages = [
    {
      num: 1,
      name: 'Ingest',
      iconName: 'upload',
      color: '#5E6E83',
      table: 'raw_operators',
      action: 'Upload CSV',
      writes: 'status: "raw"',
      reads: 'CSV file',
      description: 'New operators land in landing zone'
    },
    {
      num: 2,
      name: 'Clean',
      iconName: 'broom',
      color: '#4FA0F0',
      table: 'raw_operators → operators',
      action: 'Validate & Classify',
      writes: 'Copies promoted/needs_review to operators table',
      reads: 'raw_operators (status="raw")',
      description: '404 check + STR validation',
      splits: [
        { label: 'promoted', count: '590', color: '#22D3AA' },
        { label: 'needs_review', count: '112', color: '#F5B13D' },
        { label: 'churned', count: '89', color: '#9CA9BA' },
        { label: 'dead', count: '23', color: '#EF4444' },
        { label: 'not_str', count: '186', color: '#64748B' }
      ]
    },
    {
      num: 3,
      name: 'Name Enrich',
      iconName: 'target',
      color: '#38BDF8',
      table: 'operators',
      action: 'Find Contact Names',
      writes: 'contact_name, contact_email, contact_phone',
      reads: 'operators (no contact_name)',
      description: 'Web scraping + B2B APIs (Snov, Prospeo)'
    },
    {
      num: 4,
      name: 'Clay Push',
      iconName: 'sparkles',
      color: '#8B7BFF',
      table: 'operators',
      action: 'Full Enrichment',
      writes: 'clay_email, clay_phone, clay_linkedin',
      reads: 'operators (enrichment_status="needs_clay")',
      description: 'Send to Clay for deep enrichment (optional, costs $$$)'
    },
    {
      num: 5,
      name: 'Score',
      iconName: 'gauge',
      color: '#5FD0C0',
      table: 'operators',
      action: 'Calculate ICP Fit',
      writes: 'score (0-100), qualified (true/false)',
      reads: 'operators (no score)',
      description: 'Based on size, location, title, etc.'
    },
    {
      num: 6,
      name: 'Sync',
      iconName: 'cloud',
      color: '#22D3EE',
      table: 'operators → Attio CRM',
      action: 'Push to CRM',
      writes: 'attio_record_id, attio_synced_at',
      reads: 'operators (qualified=true, not synced)',
      description: 'Send qualified leads to SDR team'
    }
  ]

  const getIcon = (name: string) => {
    const icons: Record<string, JSX.Element> = {
      upload: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V5M8 9l4-4 4 4"/>
          <path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/>
        </svg>
      ),
      broom: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20a7 7 0 01-7-7c0-4 3-7 7-7s7 3 7 7a7 7 0 01-7 7z"/>
          <path d="M16 11l5-5M5.5 5.5l4 4"/>
        </svg>
      ),
      target: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      sparkles: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
          <path d="M19 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/>
        </svg>
      ),
      gauge: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16a4 4 0 100-8 4 4 0 000 8z"/>
          <path d="M3 12a9 9 0 1118 0"/>
        </svg>
      ),
      cloud: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10a6 6 0 00-11.8-1.4A5 5 0 107 18h11a5 5 0 000-10z"/>
        </svg>
      )
    }
    return icons[name] || null
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3zM3 9h18M9 3v18" />
            </svg>
            Pipeline Architecture
          </div>
          <div className="card-meta">End-to-end data flow · 6 stages · 2 tables</div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Flow diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stages.map((stage, i) => (
            <React.Fragment key={i}>
              {/* Stage card */}
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                background: 'var(--bg-card)',
                position: 'relative'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${stage.color}22`,
                    border: `2px solid ${stage.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stage.color,
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'var(--mono)'
                  }}>
                    {stage.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: stage.color }}>{getIcon(stage.iconName)}</span>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{stage.name}</span>
                      <span className="badge" style={{
                        fontSize: '10px',
                        background: `${stage.color}15`,
                        color: stage.color,
                        border: `1px solid ${stage.color}40`
                      }}>
                        {stage.action}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-mute)' }}>
                      {stage.description}
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginTop: '12px',
                  padding: '12px',
                  background: 'var(--bg-raised)',
                  borderRadius: '6px'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Reads From
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                      {stage.reads}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Writes To
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: stage.color }}>
                      {stage.table}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Fields Updated
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-mute)' }}>
                      {stage.writes}
                    </div>
                  </div>
                </div>

                {/* Clean stage splits */}
                {stage.splits && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginBottom: '8px', fontWeight: 600 }}>
                      Classification Results:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {stage.splits.map((split, j) => (
                        <div key={j} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: `${split.color}15`,
                          border: `1px solid ${split.color}40`,
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          <span style={{ fontWeight: 600, fontFamily: 'var(--mono)', color: split.color }}>
                            {split.count}
                          </span>
                          <span style={{ color: 'var(--text-mute)' }}>{split.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: 'rgba(34, 211, 170, 0.1)',
                      border: '1px solid rgba(34, 211, 170, 0.3)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#22D3AA'
                    }}>
                      → Only <strong>promoted</strong> and <strong>needs_review</strong> copied to operators table
                    </div>
                  </div>
                )}
              </div>

              {/* Arrow between stages */}
              {i < stages.length - 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '-8px 0'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Summary footer */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--bg-raised)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
            Key Takeaways
          </div>
          <ul style={{
            fontSize: '12px',
            color: 'var(--text-mute)',
            lineHeight: '1.6',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li><strong>Single source of truth:</strong> <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>raw_operators</code> table grows with each upload</li>
            <li><strong>Automatic deduplication:</strong> Same domain uploaded twice = skipped</li>
            <li><strong>Clean stage copies promoted operators:</strong> Only validated STR businesses reach <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>operators</code> table</li>
            <li><strong>Enrichment happens AFTER copy:</strong> Name Enrich, Score, and Sync all operate on <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>operators</code> table</li>
            <li><strong>Autonomous processing:</strong> Each stage picks up where the previous left off, every 30 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
