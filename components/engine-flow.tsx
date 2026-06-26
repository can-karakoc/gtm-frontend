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
  return (
    <div className="engine">
      {stages.map((stage, i) => (
        <div key={i}>
          <div className="stage" style={{['--sc' as any]: stage.color}}>
            <div className="stage-top">
              <span className="stage-ic">{stage.icon}</span>
              <span className="stage-nm">{stage.name}</span>
            </div>
            <div className="stage-sub">{stage.subtitle}</div>
            <div className="stage-n mono">{stage.count}</div>
            {stage.drop && <div className="stage-drop">{stage.drop}</div>}
          </div>
          {i < stages.length - 1 && <div className="arrow">→</div>}
        </div>
      ))}
    </div>
  )
}
