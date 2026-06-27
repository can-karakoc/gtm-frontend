'use client'

import { useState } from 'react'
import { Play, Loader } from '@/components/icons'

interface ManualTriggersProps {
  onTrigger?: () => void
}

const STAGES = [
  { key: 'clean', name: 'Clean', color: '#4FA0F0', safe: true },
  { key: 'name_enrich', name: 'Name Enrich', color: '#38BDF8', safe: true },
  { key: 'clay_push', name: 'Clay Push', color: '#8B7BFF', safe: false },
  { key: 'score', name: 'Score', color: '#5FD0C0', safe: true },
  { key: 'sync', name: 'Sync', color: '#22D3EE', safe: true }
]

export default function ManualTriggers({ onTrigger }: ManualTriggersProps) {
  const [running, setRunning] = useState<Record<string, boolean>>({})

  const handleTrigger = async (stage: string, stageName: string) => {
    const confirmed = stage === 'clay_push'
      ? confirm(`⚠️ WARNING: This will send operators to Clay and incur costs. Continue?`)
      : true

    if (!confirmed) return

    setRunning(prev => ({ ...prev, [stage]: true }))

    try {
      // TODO: Replace with actual pipeline service URL when service.py is running
      // For now, this will 404 - need to start the pipeline service
      const response = await fetch(`http://localhost:8001/run/${stage}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Failed to trigger ${stageName}`)
      }

      alert(`✅ ${stageName} stage triggered successfully!`)
      onTrigger?.()
    } catch (error) {
      console.error(`Error triggering ${stageName}:`, error)
      alert(`❌ Failed to trigger ${stageName}. Make sure the pipeline service is running on port 8001.`)
    } finally {
      setRunning(prev => ({ ...prev, [stage]: false }))
    }
  }

  return (
    <div className="card pad" style={{ marginTop: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div className="card-title" style={{ fontSize: '13px', marginBottom: '8px' }}>
          <Play size={16} />
          Manual Stage Triggers
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
          Run stages manually for testing or to catch up on backlogs
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {STAGES.map(stage => (
          <button
            key={stage.key}
            className="btn"
            style={{
              borderColor: stage.color,
              color: stage.color,
              fontSize: '12px',
              opacity: running[stage.key] ? 0.6 : 1
            }}
            onClick={() => handleTrigger(stage.key, stage.name)}
            disabled={running[stage.key]}
          >
            {running[stage.key] ? (
              <>
                <Loader size={14} className="spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} />
                {stage.name}
                {!stage.safe && ' 💸'}
              </>
            )}
          </button>
        ))}
      </div>

      <div style={{
        fontSize: '10px',
        color: 'var(--text-faint)',
        marginTop: '12px',
        padding: '8px',
        background: 'var(--bg-raised)',
        borderRadius: '4px'
      }}>
        💸 = Incurs API costs · Refresh page after running to see updated queues
      </div>
    </div>
  )
}
