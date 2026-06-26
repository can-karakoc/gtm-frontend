interface HistogramProps {
  /** Array of values for histogram bars */
  data: number[];
  /** Labels for x-axis */
  labels: string[];
  /** Qualification threshold (0-100) - bars at or above this value will be highlighted */
  qualifyThreshold?: number;
  /** Label text for qualification line */
  qualifyLabel?: string;
  /** Title for the histogram card */
  title?: string;
  /** Subtitle/metadata for the histogram card */
  subtitle?: string;
  /** Description text shown below histogram */
  description?: string;
  /** Height of histogram in pixels */
  height?: number;
}

/**
 * Histogram component for score distribution visualization
 * Displays vertical bars with optional qualification threshold line
 */
export default function Histogram({
  data,
  labels,
  qualifyThreshold = 55,
  qualifyLabel = '≥ 55',
  title = 'Score distribution',
  subtitle = 'qualify ≥ 55',
  description = 'ICP score · 0–100 · bins of 10 — green bins clear the qualification gate',
  height = 160
}: HistogramProps) {
  if (!data || data.length === 0) {
    return <div className="card">No histogram data</div>
  }

  const maxValue = Math.max(...data);
  const qualifyIndex = Math.floor(qualifyThreshold / 10);

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <svg className="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20v-6M6 20V10m12 10V4" />
            </svg>
            {title}
          </div>
          <div className="card-meta">{subtitle}</div>
        </div>
        <div className="card-body">
          <div className="hist">
            {qualifyThreshold && (
              <div className="qline" style={{ left: `${qualifyThreshold}%` }}>
                <span>{qualifyLabel}</span>
              </div>
            )}
            {data.map((value, index) => (
              <div
                key={index}
                className={`hbar ${index >= qualifyIndex ? 'q' : ''}`}
                style={{ height: `${(value / maxValue) * 100}%` }}
              >
                <span className="ht">{value}</span>
              </div>
            ))}
          </div>
          <div className="hist-x">
            {labels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
          {description && (
            <div className="muted" style={{ fontSize: '12px', marginTop: '14px', textAlign: 'center' }}>
              {description}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .card {
          background: linear-gradient(180deg, var(--surface), var(--bg-raised));
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-1);
        }

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border-soft);
        }

        .card-title {
          font-weight: 700;
          font-size: 14px;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .card-title .ic {
          width: 16px;
          height: 16px;
          color: var(--text-mute);
        }

        .card-meta {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-mute);
        }

        .card-body {
          padding: 18px;
        }

        .hist {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          height: ${height}px;
          padding-top: 10px;
          position: relative;
        }

        .hbar {
          flex: 1;
          border-radius: 5px 5px 0 0;
          position: relative;
          transition: all var(--fast);
          min-height: 3px;
          background: linear-gradient(
            180deg,
            var(--enrich),
            color-mix(in srgb, var(--enrich) 40%, #0c1219)
          );
        }

        .hbar.q {
          background: linear-gradient(
            180deg,
            var(--good),
            color-mix(in srgb, var(--good) 40%, #0c1219)
          );
        }

        .hbar:hover {
          filter: brightness(1.25);
        }

        .hbar .ht {
          position: absolute;
          top: -19px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-dim);
        }

        .hist-x {
          display: flex;
          gap: 5px;
          margin-top: 7px;
        }

        .hist-x span {
          flex: 1;
          text-align: center;
          font-family: var(--mono);
          font-size: 9px;
          color: var(--text-faint);
        }

        .qline {
          position: absolute;
          top: 0;
          bottom: 24px;
          width: 2px;
          background: repeating-linear-gradient(
            180deg,
            var(--good),
            var(--good) 4px,
            transparent 4px,
            transparent 8px
          );
          z-index: 3;
        }

        .qline span {
          position: absolute;
          top: -2px;
          left: 6px;
          font-family: var(--mono);
          font-size: 9.5px;
          color: var(--good);
          white-space: nowrap;
          background: var(--bg);
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid var(--good-bg);
        }

        .muted {
          color: var(--text-mute);
        }

        .muted span {
          color: var(--good);
        }
      `}</style>
    </>
  );
}
