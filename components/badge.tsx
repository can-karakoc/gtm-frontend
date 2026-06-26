/**
 * Badge component for displaying status indicators with color mapping
 *
 * Renders a small status badge with an optional dot indicator and semantic colors.
 * Colors are mapped based on the status key to match the GTM Engine design system.
 *
 * @example
 * <Badge label="synced" status="synced" />
 * <Badge label="Enriched" status="enriched" size="lg" />
 * <Badge label="Custom" status="custom" color="#FF0000" backgroundColor="rgba(255,0,0,0.15)" />
 */

interface BadgeProps {
  /** The text label to display in the badge */
  label: string;
  /** The status key used for color mapping (e.g., 'synced', 'qualified', 'enriched') */
  status?: string;
  /** Size variant - 'sm' (default) or 'lg' */
  size?: 'sm' | 'lg';
  /** Show the dot indicator (default: true) */
  showDot?: boolean;
  /** Custom text color (overrides status-based color) */
  color?: string;
  /** Custom background color (overrides status-based color) */
  backgroundColor?: string;
  /** Custom border color (optional, computed from color if not provided) */
  borderColor?: string;
}

export default function Badge({
  label,
  status,
  size = 'sm',
  showDot = true,
  color,
  backgroundColor,
  borderColor,
}: BadgeProps) {
  // Color mapping for different statuses (matches GTM Engine design system)
  const colorMap: Record<string, [string, string]> = {
    raw: ['#5E6E83', 'rgba(94,110,131,.15)'],
    clean: ['#4FA0F0', 'rgba(79,160,240,.15)'],
    ready_to_enrich: ['#38BDF8', 'rgba(56,189,248,.15)'],
    clay_pending: ['#F5B13D', 'rgba(245,177,61,.15)'],
    clay_sent: ['#F59E3D', 'rgba(245,158,61,.15)'],
    enriched: ['#8B7BFF', 'rgba(139,123,255,.15)'],
    scored: ['#5FD0C0', 'rgba(95,208,192,.15)'],
    qualified: ['#35D399', 'rgba(53,211,153,.15)'],
    disqualified: ['#FB6F84', 'rgba(251,111,132,.15)'],
    synced: ['#22D3EE', 'rgba(34,211,238,.15)'],
    dead: ['#5E6E83', 'rgba(94,110,131,.15)'],
    not_str: ['#5E6E83', 'rgba(94,110,131,.15)'],
    churned: ['#FB6F84', 'rgba(251,111,132,.15)'],
    needs_review: ['#F5B13D', 'rgba(245,177,61,.15)'],
    no_custom_domain: ['#5E6E83', 'rgba(94,110,131,.15)'],
    publicly_reachable_only: ['#38BDF8', 'rgba(56,189,248,.15)'],
    no_public_contact: ['#FB6F84', 'rgba(251,111,132,.15)'],
    clay_full: ['#35D399', 'rgba(53,211,153,.15)'],
    clay_email: ['#22D3EE', 'rgba(34,211,238,.15)'],
    clay_phone: ['#F5B13D', 'rgba(245,177,61,.15)'],
    clay_linkedin: ['#4FA0F0', 'rgba(79,160,240,.15)'],
    clay_no_data: ['#FB6F84', 'rgba(251,111,132,.15)'],
  };

  // Get colors from status or use custom colors or fallback to default
  const [statusColor, statusBg] = status && colorMap[status]
    ? colorMap[status]
    : ['#9CA9BA', 'rgba(156,169,186,.14)'];

  const finalColor = color || statusColor;
  const finalBg = backgroundColor || statusBg;
  const finalBorderColor = borderColor || `color-mix(in srgb, ${finalColor} 24%, transparent)`;

  return (
    <>
      <span
        className={`badge ${size === 'lg' ? 'lg' : ''}`}
        data-c
        style={{
          '--c': finalColor,
          '--cb': finalBg,
          color: finalColor,
          background: finalBg,
          borderColor: finalBorderColor,
        } as React.CSSProperties & { '--c': string; '--cb': string }}
      >
        {showDot && <span className="d"></span>}
        {label}
      </span>

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono, 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace);
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: var(--r-pill, 999px);
          background: var(--surface-2, #172029);
          color: var(--text-dim, #9CA9BA);
          border: 1px solid transparent;
          white-space: nowrap;
          vertical-align: middle;
        }

        .badge.lg {
          font-size: 12px;
          padding: 4px 11px;
        }

        .badge .d {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex: 0 0 6px;
        }

        .badge[data-c] {
          color: var(--c);
          background: var(--cb);
          border-color: color-mix(in srgb, var(--c) 24%, transparent);
        }
      `}</style>
    </>
  );
}
