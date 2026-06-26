/**
 * ChartMeter Component
 *
 * Horizontal meter bar with three visual variants for displaying progress/metrics.
 *
 * @example
 * ```tsx
 * <ChartMeter value={62} max={100} variant="default" />
 * <ChartMeter value={40} variant="brand" />
 * <ChartMeter value={85} variant="good" />
 * ```
 */

interface ChartMeterProps {
  /**
   * Current value to display as progress
   */
  value: number

  /**
   * Maximum value for calculating percentage (defaults to 100)
   * @default 100
   */
  max?: number

  /**
   * Visual variant:
   * - `default`: Amber/accent gradient (cost, budget, heat)
   * - `brand`: Violet/brand gradient (AI, primary actions)
   * - `good`: Green gradient (health, success metrics)
   * @default 'default'
   */
  variant?: 'default' | 'brand' | 'good'

  /**
   * Custom CSS class name for additional styling
   */
  className?: string

  /**
   * Transition duration in seconds
   * @default 0.6
   */
  duration?: number
}

export default function ChartMeter({
  value,
  max = 100,
  variant = 'default',
  className = '',
  duration = 0.6
}: ChartMeterProps) {
  // Calculate percentage, ensuring it's between 0 and 100
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <>
      <div className={`meter ${variant} ${className}`}>
        <div
          className="meter-fill"
          style={{
            width: `${percentage}%`,
            transitionDuration: `${duration}s`
          }}
        />
      </div>

      <style jsx>{`
        /* ---------- meter ---------- */
        .meter {
          height: 9px;
          border-radius: 99px;
          background: var(--surface-3, #1C2731);
          overflow: hidden;
          position: relative;
        }

        .meter-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--accent, #F5B13D), #F7C766);
          transition: width 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .meter.brand .meter-fill {
          background: linear-gradient(90deg, var(--brand, #7C76FF), var(--brand-bright, #9D98FF));
        }

        .meter.good .meter-fill {
          background: linear-gradient(90deg, var(--good, #35D399), #6fe6b6);
        }
      `}</style>
    </>
  )
}
