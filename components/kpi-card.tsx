interface KPICardProps {
  /** Label shown at top of card (uppercase) */
  label: string;
  /** Primary value to display */
  value: string | number;
  /** Optional smaller suffix for value (e.g., "· 165") */
  valueSuffix?: string;
  /** Delta/change information */
  delta: {
    /** Text to show (e.g., "+27", "−$0.06", "54%") */
    text: string;
    /** Direction: "up" (green), "down" (red), or "flat" (gray) */
    direction: 'up' | 'down' | 'flat';
  };
  /** Note text shown at bottom */
  note: string;
  /** Accent color for top stripe and icon (CSS color value) */
  accentColor: string;
  /** Icon SVG element or string */
  icon: React.ReactNode;
  /** Sparkline data points (array of numbers) */
  sparklineData: number[];
}

/**
 * KPI Card component with sparkline, delta pill, and accent stripe
 * Displays key performance indicators with visual trend data
 */
export default function KPICard({
  label,
  value,
  valueSuffix,
  delta,
  note,
  accentColor,
  icon,
  sparklineData,
}: KPICardProps) {
  // Generate sparkline SVG
  const generateSparkline = () => {
    const w = 78;
    const h = 26;
    const mx = Math.max(...sparklineData);
    const mn = Math.min(...sparklineData);
    const rg = (mx - mn) || 1;

    const pts = sparklineData
      .map((v, i) => {
        const x = (i / (sparklineData.length - 1) * w).toFixed(1);
        const y = (h - ((v - mn) / rg) * (h - 5) - 2.5).toFixed(1);
        return `${x},${y}`;
      })
      .join(' ');

    const lx = w;
    const ly = (h - ((sparklineData[sparklineData.length - 1] - mn) / rg) * (h - 5) - 2.5).toFixed(1);

    return (
      <svg
        className="spark"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <polyline
          points={pts}
          fill="none"
          stroke={accentColor}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.95"
        />
        <circle cx={lx} cy={ly} r="2.2" fill={accentColor} />
      </svg>
    );
  };

  // Delta arrow symbol
  const deltaSymbol = delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '■';

  return (
    <>
      <div className="kpi" style={{ '--accent-color': accentColor } as React.CSSProperties}>
        <div className="kpi-top">
          <span className="kpi-label">{label}</span>
          <span className="kpi-ic">{icon}</span>
        </div>

        <div className="kpi-value">
          {value}
          {valueSuffix && <small> {valueSuffix}</small>}
        </div>

        <div className="kpi-foot">
          <span className={`delta ${delta.direction}`}>
            {deltaSymbol} {delta.text}
          </span>
          {generateSparkline()}
        </div>

        <div className="kpi-note">{note}</div>
      </div>

      <style jsx>{`
        .kpi {
          position: relative;
          background: linear-gradient(180deg, #121821, #0E131A);
          border: 1px solid #222C38;
          border-radius: 13px;
          padding: 15px 16px 14px;
          overflow: hidden;
          transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
                      transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kpi:hover {
          border-color: #30404F;
          transform: translateY(-2px);
        }

        .kpi::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-color, #7C76FF);
          opacity: 0.85;
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-label {
          font-size: 10px;
          color: #9CA9BA;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .kpi-ic {
          width: 15px;
          height: 15px;
          color: var(--accent-color, #9CA9BA);
          opacity: 0.8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-value {
          font-family: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 29px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-top: 9px;
          line-height: 1;
        }

        .kpi-value small {
          font-size: 14px;
          color: #9CA9BA;
          font-weight: 500;
        }

        .kpi-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 9px;
          gap: 8px;
        }

        .delta {
          font-family: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          border-radius: 999px;
        }

        .delta.up {
          color: #35D399;
          background: rgba(53, 211, 153, 0.14);
        }

        .delta.down {
          color: #FB6F84;
          background: rgba(251, 111, 132, 0.14);
        }

        .delta.flat {
          color: #9CA9BA;
          background: #172029;
        }

        .kpi-note {
          font-family: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 10px;
          color: #465162;
          margin-top: 7px;
        }

        .spark {
          height: 26px;
          width: 78px;
        }
      `}</style>
    </>
  );
}
