'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'

// Stage configuration with explanations
const STAGE_CONFIG = [
  {
    key: 'clean',
    name: 'Clean',
    subtitle: 'Validates operators are live STR businesses',
    description: 'Checks domain liveness and validates they are short-term rental operators (not property managers or other businesses)',
    color: '#4FA0F0',
    interval: 20,
    batch: 100,
    enabled: true,
    batchMax: 500,
    danger: false
  },
  {
    key: 'name_enrich',
    name: 'Name enrich',
    subtitle: 'Finds decision-maker names via web scraping + B2B APIs',
    description: 'Uses website scraping and paid B2B providers (Snov, Prospeo, LeadMagic) to find the operator\'s name',
    color: '#38BDF8',
    interval: 30,
    batch: 30,
    enabled: true,
    batchMax: 100,
    danger: false
  },
  {
    key: 'clay_push',
    name: 'Clay push',
    subtitle: 'Send to Clay for email + phone enrichment',
    description: 'Sends operators to Murat\'s Clay workspace for full enrichment (email, phone, LinkedIn). Budget-gated for cost control.',
    color: '#8B7BFF',
    interval: 30,
    batch: 20,
    enabled: false,
    batchMax: 100,
    danger: true
  },
  {
    key: 'score',
    name: 'Score',
    subtitle: 'Calculate ICP fit score based on size, location, tech',
    description: 'Scores operators 0-100 based on ideal customer profile (property count, location, website quality, etc.)',
    color: '#5FD0C0',
    interval: 15,
    batch: 200,
    enabled: true,
    batchMax: 500,
    danger: false
  },
  {
    key: 'sync',
    name: 'Sync',
    subtitle: 'Push qualified leads to Attio CRM',
    description: 'Syncs operators with score ≥55 to Attio for SDR outreach. Only syncs qualified leads.',
    color: '#22D3EE',
    interval: 30,
    batch: 20,
    enabled: true,
    batchMax: 100,
    danger: false
  }
]

type Preset = 'conservative' | 'balanced' | 'aggressive'

export default function ConfigurationPage() {
  const [stageSettings, setStageSettings] = useState(STAGE_CONFIG)
  const [selectedPreset, setSelectedPreset] = useState<Preset>('balanced')
  const [pipelineEnabled, setPipelineEnabled] = useState(true)
  const [globalInterval, setGlobalInterval] = useState(30) // How often to pull from raw table
  const [globalBatchSize, setGlobalBatchSize] = useState(100) // How many operators per batch
  const [minScore, setMinScore] = useState(55)
  const [requireVerifiedEmail, setRequireVerifiedEmail] = useState(false)
  const [clayBudget, setClayBudget] = useState(100)

  // Fetch real cost data
  const { data: costData } = useSWR('/api/data/cost-summary', fetcher, {
    refreshInterval: 30000
  })

  // Calculate estimated costs (projection based on current settings)
  const calculateEstimatedCosts = () => {
    const nameSetting = stageSettings.find(s => s.key === 'name_enrich')
    const cleanSetting = stageSettings.find(s => s.key === 'clean')

    // Estimate based on batch size and run frequency
    const runsPerDay = 1440 / (nameSetting?.interval || 30) // minutes in a day / interval
    const nameDaily = nameSetting && pipelineEnabled ? (nameSetting.batch * runsPerDay * 0.01) : 0
    const cleanDaily = cleanSetting && pipelineEnabled ? (cleanSetting.batch * runsPerDay * 0.005) : 0

    const daily = nameDaily + cleanDaily

    return { nameDaily, cleanDaily, daily }
  }

  const estimatedCosts = calculateEstimatedCosts()

  // Real costs from API (today, this week, all time)
  const realCosts = {
    today: costData?.totals?.today || 0,
    thisWeek: costData?.totals?.this_week || 0,
    allTime: costData?.totals?.all_time || 0
  }

  const handleIntervalChange = (key: string, value: number) => {
    setStageSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, interval: value } : s))
    )
  }

  const handleBatchChange = (key: string, value: number) => {
    setStageSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, batch: value } : s))
    )
  }

  const handleToggle = (key: string) => {
    setStageSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset)
    const presets: Record<Preset, { interval: number; batchSize: number }> = {
      conservative: { interval: 60, batchSize: 50 },
      balanced: { interval: 30, batchSize: 100 },
      aggressive: { interval: 10, batchSize: 200 }
    }

    const settings = presets[preset]
    setGlobalInterval(settings.interval)
    setGlobalBatchSize(settings.batchSize)
  }

  const handleSaveConfig = () => {
    // TODO: Implement API call to save configuration
    console.log('Saving configuration...', {
      stageSettings,
      minScore,
      requireVerifiedEmail,
      clayBudget
    })
  }

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Controls</div>
          <div className="h1">Pipeline Configuration</div>
          <div className="sub">
            Control how often stages run and how many operators they process per run.
            Use presets for quick setup or fine-tune each stage individually.
          </div>
        </div>
      </div>

      <div className="cfg-grid">
        {/* Left column: Stage runners & controls */}
        <div className="stage-cfg">
          {/* Pipeline Control */}
          <div className="card pad" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                  Pipeline Automation
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-mute)' }}>
                  {pipelineEnabled
                    ? '✓ Pipeline is running - operators are processed automatically'
                    : '✗ Pipeline is paused - operators will queue until enabled'}
                </div>
              </div>
              <label className="switch" style={{ transform: 'scale(1.2)' }}>
                <input
                  type="checkbox"
                  checked={pipelineEnabled}
                  onChange={() => setPipelineEnabled(!pipelineEnabled)}
                />
                <span className="tk"></span>
              </label>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-raised)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-mute)', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--text)' }}>How it works:</strong> When enabled, the pipeline automatically reads operators from the raw table and processes them through all stages (Clean → Name Enrich → Score → Sync). Each stage runs at fixed intervals below.
            </div>
          </div>

          {/* Stage runners card */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
                  <circle cx="16" cy="8" r="2.2" />
                  <circle cx="8" cy="16" r="2.2" />
                </svg>
                Stage timing & batch sizes
              </div>
              <div className="card-meta">{pipelineEnabled ? 'active' : 'paused'}</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                Pipeline batch configuration
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-mute)', marginBottom: '8px' }}>
                  Pull from raw table every <b style={{ color: 'var(--brand)' }}>{globalInterval} minutes</b>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={globalInterval}
                  onChange={e => setGlobalInterval(parseInt(e.target.value))}
                  disabled={!pipelineEnabled}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>
                  5m (very frequent) ← → 120m (infrequent)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-mute)', marginBottom: '8px' }}>
                  Process <b style={{ color: 'var(--brand)' }}>{globalBatchSize} operators</b> per batch through entire funnel
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={globalBatchSize}
                  onChange={e => setGlobalBatchSize(parseInt(e.target.value))}
                  disabled={!pipelineEnabled}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>
                  10 (small batches) ← → 500 (large batches)
                </div>
              </div>

              <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-mute)', lineHeight: '1.5' }}>
                💡 Pipeline pulls {globalBatchSize} operators from raw table every {globalInterval} minutes and processes them through all stages sequentially.
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-mute)' }}>
                Stage descriptions (automatic processing)
              </div>
            </div>
            <div className="stage-cfg">
              {stageSettings.map(stage => (
                <div
                  key={stage.key}
                  className="cfg-row"
                  style={{ '--sc': stage.color } as React.CSSProperties}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border-soft)' }}>
                    <span className="ic" style={{ color: stage.color, marginTop: '2px' }}>
                      {getStageIcon(stage.key)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', color: 'var(--text)' }}>
                        {stage.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-mute)', lineHeight: '1.5' }}>
                        {stage.subtitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Presets card */}
          <div className="card pad" style={{ marginTop: '16px' }}>
            <div
              className="card-title"
              style={{ fontSize: '13px', marginBottom: '12px' }}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
              </svg>
              Presets
            </div>
            <div className="preset-row">
              <button
                className={`preset ${selectedPreset === 'conservative' ? 'sel' : ''}`}
                onClick={() => applyPreset('conservative')}
              >
                <div className="pn">Conservative</div>
                <div className="pd">Run every 60m · Small batches · Low cost</div>
              </button>
              <button
                className={`preset ${selectedPreset === 'balanced' ? 'sel' : ''}`}
                onClick={() => applyPreset('balanced')}
              >
                <div className="pn">Balanced</div>
                <div className="pd">Run every 30m · Medium batches · Recommended</div>
              </button>
              <button
                className={`preset ${selectedPreset === 'aggressive' ? 'sel' : ''}`}
                onClick={() => applyPreset('aggressive')}
              >
                <div className="pn">Aggressive</div>
                <div className="pd">Run every 10m · Large batches · High cost</div>
              </button>
            </div>
          </div>

          {/* Quality gates card */}
          <div className="card pad" style={{ marginTop: '16px' }}>
            <div
              className="card-title"
              style={{ fontSize: '13px', marginBottom: '14px' }}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Quality gates
            </div>
            <div className="ctrl" style={{ minWidth: 'auto', marginBottom: '8px' }}>
              <div className="cl" style={{ fontSize: '13px', fontWeight: 600 }}>
                Minimum ICP score to sync to Attio: <b style={{ color: 'var(--brand)' }}>{minScore}</b>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={e => setMinScore(parseInt(e.target.value))}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                0 (sync all) ← → 100 (only perfect fits)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '6px', padding: '8px', background: 'var(--bg-raised)', borderRadius: '4px' }}>
                💡 Operators with score ≥ {minScore} will be synced to Attio. Recommended: 55+ for qualified leads.
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderTop: '1px solid var(--border-soft)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                  Require verified email
                </div>
                <div
                  className="muted"
                  style={{ fontSize: '11.5px' }}
                >
                  Only sync operators with a verified work email
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={requireVerifiedEmail}
                  onChange={e => setRequireVerifiedEmail(e.target.checked)}
                />
                <span className="tk"></span>
              </label>
            </div>
            <div className="field" style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Daily Clay enrichment limit
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginBottom: '8px' }}>
                Maximum number of operators to send to Clay per day (cost control)
              </div>
              <input
                className="input"
                type="number"
                min="0"
                max="1000"
                value={clayBudget}
                onChange={e => setClayBudget(parseInt(e.target.value) || 0)}
                style={{ fontSize: '14px', fontFamily: 'var(--mono)' }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>
                ~${(clayBudget * 0.02).toFixed(2)}/day at $0.02 per operator
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Cost tracker */}
        <div className="card pad cost-calc">
          <div className="eyebrow">Actual cost (pre-Clay)</div>
          <div className="cost-big">
            ${realCosts.today.toFixed(2)}
            <small> / today</small>
          </div>
          <div
            className="mono"
            style={{
              fontSize: '11px',
              color: 'var(--text-mute)',
              marginTop: '2px'
            }}
          >
            from pipeline runs
          </div>

          <div className="hr" style={{ margin: '16px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="muted">This week</span>
            <b className="mono">${realCosts.thisWeek.toFixed(2)}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="muted">All time</span>
            <b className="mono">${realCosts.allTime.toFixed(2)}</b>
          </div>

          {/* Estimated cost section */}
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-raised)', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-mute)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Projected at current settings
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
              ${estimatedCosts.daily.toFixed(2)}
              <small style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-mute)' }}> / day</small>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>
              if pipeline runs continuously
            </div>
          </div>

          {estimatedCosts.daily > 10 && (
            <div className="warn-box">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l9 16H3z" />
                <path d="M12 9v5M12 17h.01" />
              </svg>
              High daily spend detected. Review batch sizes before saving.
            </div>
          )}
          <button
            className="btn primary"
            style={{
              width: '100%',
              marginTop: '18px',
              justifyContent: 'center'
            }}
            onClick={handleSaveConfig}
          >
            Save configuration
          </button>
          <div
            className="muted"
            style={{
              fontSize: '11px',
              textAlign: 'center',
              marginTop: '8px'
            }}
          >
            Clay push is OFF by default for safety
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get stage-specific icons
function getStageIcon(key: string) {
  const icons: Record<string, JSX.Element> = {
    clean: (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 5l-7 7M9 15s-2 1-3 3 0 1 0 1 1 1 3 0 3-3 3-3M16 8l3-3M5 19l4-4" />
      </svg>
    ),
    name_enrich: (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
    clay_push: (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
        <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z" />
      </svg>
    ),
    score: (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 18a8 8 0 1116 0" />
        <path d="M12 18l4-5" />
      </svg>
    ),
    sync: (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 18a4 4 0 00.5-8 6 6 0 00-11.5 1.5A3.5 3.5 0 006.5 18z" />
      </svg>
    )
  }
  return icons[key] || null
}
