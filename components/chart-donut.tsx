/**
 * ChartDonut - SVG donut chart with center labels
 *
 * A conic gradient-based donut chart component matching the GTM Engine design system.
 * Displays segments in a circular donut with customizable center content.
 */

export interface DonutSegment {
  /** The value/count for this segment */
  value: number
  /** The color for this segment (CSS color value) */
  color: string
  /** Optional label for the segment */
  label?: string
}

export interface ChartDonutProps {
  /** Array of segments to display in the donut */
  segments: DonutSegment[]
  /** Size of the donut in pixels (width and height) */
  size?: number
  /** Inner hole size in pixels (distance from edge) */
  innerSize?: number
  /** Main center label/value (large text) */
  centerValue?: string | number
  /** Secondary center label (small text above value) */
  centerLabel?: string
  /** Optional className for wrapper */
  className?: string
}

/**
 * ChartDonut component
 *
 * Renders a donut chart using conic-gradient for segments with a center hole
 * showing summary information.
 *
 * @example
 * ```tsx
 * <ChartDonut
 *   segments={[
 *     { value: 96, color: '#35D399', label: 'clay_full' },
 *     { value: 121, color: '#22D3EE', label: 'clay_email' },
 *     { value: 44, color: '#4FA0F0', label: 'clay_phone' }
 *   ]}
 *   size={168}
 *   centerValue={312}
 *   centerLabel="enriched"
 * />
 * ```
 */
export default function ChartDonut({
  segments,
  size = 168,
  innerSize = 25,
  centerValue,
  centerLabel,
  className = ''
}: ChartDonutProps) {
  if (!segments || segments.length === 0) {
    return <div className="donut">No data</div>
  }

  // Calculate total for percentages
  const total = segments.reduce((acc, seg) => acc + seg.value, 0)

  // Build conic-gradient stops
  let accumulated = 0
  const gradientStops = segments.map(seg => {
    const startPercent = (accumulated / total) * 100
    const endPercent = ((accumulated + seg.value) / total) * 100
    accumulated += seg.value
    return `${seg.color} ${startPercent.toFixed(2)}% ${endPercent.toFixed(2)}%`
  }).join(', ')

  return (
    <>
      <div
        className={`donut ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `conic-gradient(${gradientStops})`
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: `${innerSize}px`,
            borderRadius: '50%',
            background: 'var(--bg-raised)',
            boxShadow: 'inset 0 0 14px rgba(0, 0, 0, 0.5)'
          }}
        />
        {(centerValue !== undefined || centerLabel) && (
          <div className="center" style={{ zIndex: 10 }}>
            {centerValue !== undefined && (
              <div className="big mono">{centerValue}</div>
            )}
            {centerLabel && (
              <div className="lab">{centerLabel}</div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .donut {
          position: relative;
          flex: 0 0 ${size}px;
        }

        .center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 2px;
        }

        .big {
          font-family: var(--mono);
          font-size: ${size > 150 ? '24px' : '18px'};
          font-weight: 600;
        }

        .lab {
          font-size: ${size > 150 ? '10px' : '9px'};
          color: var(--text-mute);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--mono);
        }

        .mono {
          font-family: var(--mono);
        }
      `}</style>
    </>
  )
}
