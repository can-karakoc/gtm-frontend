interface StageHealthCardProps {
  /** Stage name/identifier (e.g., "clean", "name_enrich", "clay_push") */
  name: string;
  /** Status indicator: "ok" (green), "warn" (amber), "err" (red), "off" (gray) */
  status: "ok" | "warn" | "err" | "off";
  /** Last run time text (e.g., "2m ago", "1h 6m ago") */
  lastRun: string;
  /** Number of rows processed in last run */
  rows: string | number;
  /** Next run time or status (e.g., "18m", "paused", "budget") */
  next: string;
  /** Progress percentage for next run countdown (0-100) */
  progressPercent: number;
  /** Stage color for icon (hex or CSS variable) */
  color: string;
  /** SVG icon markup as string */
  icon: string;
  /** Whether the stage is enabled/active */
  enabled?: boolean;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Stage Health Card Component
 *
 * Displays health status and metrics for a GTM Engine pipeline stage.
 * Shows status indicator dot, last run time, rows processed, next run schedule,
 * and a progress bar for the next run countdown.
 *
 * @example
 * ```tsx
 * <StageHealthCard
 *   name="clean"
 *   status="ok"
 *   lastRun="2m ago"
 *   rows="8"
 *   next="18m"
 *   progressPercent={14}
 *   color="#4FA0F0"
 *   icon="<svg>...</svg>"
 *   enabled
 * />
 * ```
 */
export default function StageHealthCard({
  name,
  status,
  lastRun,
  rows,
  next,
  progressPercent,
  color,
  icon,
  enabled = true,
  onClick,
}: StageHealthCardProps) {
  // Determine progress bar color based on status
  const getProgressColor = () => {
    switch (status) {
      case "warn":
        return "var(--accent)";
      case "err":
        return "var(--bad)";
      default:
        return "var(--brand)";
    }
  };

  return (
    <>
      <div
        className={`shealth ${!enabled ? "disabled" : ""}`}
        onClick={onClick}
      >
        <div className="shealth-top">
          <span
            className="ic"
            style={{ width: "15px", height: "15px", color }}
            dangerouslySetInnerHTML={{ __html: icon }}
          />
          <span className="nm">{name}</span>
          <span className={`st ${status}`} />
        </div>
        <div className="shealth-row">
          <span>last run</span>
          <b>{lastRun}</b>
        </div>
        <div className="shealth-row">
          <span>rows</span>
          <b>{rows}</b>
        </div>
        <div className="shealth-row">
          <span>next</span>
          <b>{next}</b>
        </div>
        <div className="next-bar">
          <i style={{ width: `${progressPercent}%`, background: getProgressColor() }} />
        </div>
      </div>
      <style jsx>{`
        .shealth {
          background: linear-gradient(180deg, var(--surface), var(--bg-raised));
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 13px 14px;
          transition: all var(--fast);
          cursor: pointer;
        }
        .shealth:hover {
          border-color: var(--border-strong);
          transform: translateY(-2px);
        }
        .shealth.disabled {
          opacity: 0.62;
        }
        .shealth-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .shealth-top .ic {
          flex-shrink: 0;
        }
        .shealth-top .nm {
          font-weight: 600;
          font-size: 12.5px;
        }
        .shealth-top .st {
          margin-left: auto;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .st.ok {
          background: var(--good);
          box-shadow: 0 0 8px var(--good);
        }
        .st.warn {
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }
        .st.err {
          background: var(--bad);
          box-shadow: 0 0 8px var(--bad);
        }
        .st.off {
          background: var(--text-faint);
        }
        .shealth-row {
          display: flex;
          justify-content: space-between;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-mute);
          margin-top: 4px;
        }
        .shealth-row b {
          color: var(--text-dim);
          font-weight: 500;
        }
        .next-bar {
          height: 4px;
          border-radius: 99px;
          background: var(--surface-3);
          margin-top: 11px;
          overflow: hidden;
        }
        .next-bar i {
          display: block;
          height: 100%;
          background: var(--brand);
          border-radius: 99px;
        }
      `}</style>
    </>
  );
}
