interface ActivityRun {
  stage: string
  time: string
  duration: string
  claimed: number
  ok: number
  fail: number
  cost: number
  trigger: string
}

interface ActivityTableProps {
  runs: ActivityRun[]
}

export default function ActivityTable({ runs }: ActivityTableProps) {
  if (!runs || runs.length === 0) {
    return <div className="tbl-wrap">No activity data</div>
  }

  return (
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
          </tr>
        </thead>
        <tbody>
          {runs.map((run, i) => (
            <tr key={i}>
              <td>
                <span className="badge" data-c style={{['--c' as any]: '#4FA0F0'}}>
                  {run.stage}
                </span>
              </td>
              <td className="cell-mono cell-dim">{run.time}</td>
              <td className="cell-mono">{run.duration}</td>
              <td className="cell-mono">{run.claimed}</td>
              <td className="cell-mono">
                <span style={{color: 'var(--good)'}}>{run.ok}</span> /{' '}
                {run.fail > 0 ? (
                  <span style={{color: 'var(--bad)'}}>{run.fail}</span>
                ) : (
                  <span className="cell-dim">0</span>
                )}
              </td>
              <td className="cell-mono">
                {run.cost > 0 ? `$${run.cost.toFixed(2)}` : <span className="cell-dim">$0.00</span>}
              </td>
              <td>
                <span className="badge" style={{fontSize: '10px'}}>{run.trigger}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
