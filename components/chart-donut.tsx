/**
 * ChartDonut - SVG donut chart with center labels
 *
 * An interactive SVG-based donut chart component matching the GTM Engine design system.
 * Displays segments in a circular donut with customizable center content and hover tooltips.
 */

import { useState } from 'react'

export interface DonutSegment {
  /** The value/count for this segment */
  value: number
  /** The color for this segment (CSS color value) */
  color: string
  /** Optional label for the segment */
  label?: string
  /** Optional description shown in tooltip */
  description?: string
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!segments || segments.length === 0) {
    return <div className="donut">No data</div>
  }

  // Calculate total for percentages
  const total = segments.reduce((acc, seg) => acc + seg.value, 0)

  // Create SVG path for each segment
  const createArc = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
    const startRadians = (startAngle - 90) * (Math.PI / 180)
    const endRadians = (endAngle - 90) * (Math.PI / 180)

    const x1 = outerRadius + outerRadius * Math.cos(startRadians)
    const y1 = outerRadius + outerRadius * Math.sin(startRadians)
    const x2 = outerRadius + outerRadius * Math.cos(endRadians)
    const y2 = outerRadius + outerRadius * Math.sin(endRadians)

    const x3 = outerRadius + innerRadius * Math.cos(endRadians)
    const y3 = outerRadius + innerRadius * Math.sin(endRadians)
    const x4 = outerRadius + innerRadius * Math.cos(startRadians)
    const y4 = outerRadius + innerRadius * Math.sin(startRadians)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `
  }

  // Build segment paths
  let accumulated = 0
  const radius = size / 2
  const innerRadius = radius - innerSize
  const segmentPaths = segments.map((seg, index) => {
    const startAngle = (accumulated / total) * 360
    const endAngle = ((accumulated + seg.value) / total) * 360
    accumulated += seg.value
    const path = createArc(startAngle, endAngle, radius, innerRadius)
    const percentage = ((seg.value / total) * 100).toFixed(1)
    return { path, percentage, startAngle, endAngle }
  })

  return (
    <>
      <div
        className={`donut ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative'
        }}
      >
        <svg width={size} height={size} style={{ display: 'block' }}>
          {segmentPaths.map((seg, index) => (
            <path
              key={index}
              d={seg.path}
              fill={segments[index].color}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.15s ease, filter 0.15s ease',
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.4 : 1,
                filter: hoveredIndex === index ? 'brightness(1.2)' : 'none'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
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
        {hoveredIndex !== null && (
          <div className="donut-tooltip">
            <div className="tooltip-title">
              {segments[hoveredIndex].label || 'Segment'}
            </div>
            <div className="tooltip-stats">
              <span><strong>{segments[hoveredIndex].value}</strong> operators</span>
              <span><strong>{segmentPaths[hoveredIndex].percentage}%</strong> of total</span>
            </div>
            {segments[hoveredIndex].description && (
              <div className="tooltip-desc">
                {segments[hoveredIndex].description}
              </div>
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
          pointer-events: none;
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

        .donut-tooltip {
          position: absolute;
          top: 50%;
          left: calc(100% + 20px);
          transform: translateY(-50%);
          background: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          padding: 12px 14px;
          min-width: 220px;
          max-width: 280px;
          box-shadow: 0 8px 24px -8px rgba(0,0,0,.6);
          z-index: 100;
          animation: tooltip-in 0.15s ease;
          pointer-events: none;
        }

        @keyframes tooltip-in {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        .tooltip-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text);
          margin-bottom: 8px;
          text-transform: capitalize;
        }

        .tooltip-stats {
          display: flex;
          gap: 16px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-dim);
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-soft);
        }

        .tooltip-stats strong {
          color: var(--text);
          font-weight: 600;
        }

        .tooltip-desc {
          font-size: 12px;
          color: var(--text-mute);
          line-height: 1.5;
        }
      `}</style>
    </>
  )
}
