'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AutoRefreshProvider, useAutoRefresh } from '@/lib/auto-refresh-context';
import { useState, useEffect } from 'react';

// Icon components
const Icons = {
  grid: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  funnel: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v6l-4 2v-8z"/>
    </svg>
  ),
  pulse: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2-6 4 12 2-6h6"/>
    </svg>
  ),
  logs: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <path d="M8 9h8M8 13h8M8 17h5"/>
    </svg>
  ),
  people: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      <path d="M16 6a3 3 0 010 6M21 20c0-2.5-1.5-4.7-3.5-5.6"/>
    </svg>
  ),
  upload: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V5M8 9l4-4 4 4"/>
      <path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/>
    </svg>
  ),
  sliders: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 8h10M18 8h2M4 16h2M10 16h10"/>
      <circle cx="16" cy="8" r="2.2"/>
      <circle cx="8" cy="16" r="2.2"/>
    </svg>
  ),
  swatch: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17a3 3 0 006 0V5a1 1 0 00-1-1H5a1 1 0 00-1 1z"/>
      <path d="M10 11l5-5 3 3-9 9"/>
      <path d="M7 17h.01"/>
    </svg>
  ),
  blueprint: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4-4"/>
    </svg>
  ),
  bell: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.7 21a2 2 0 01-3.4 0"/>
    </svg>
  ),
  logout: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// Navigation structure
const NAV = [
  { sec: 'Monitor' },
  { p: 'overview', ic: Icons.grid, t: 'Overview' },
  { p: 'funnel', ic: Icons.funnel, t: 'Funnel' },
  { p: 'health', ic: Icons.pulse, t: 'Health', badge: '2', alert: true },
  { p: 'logs', ic: Icons.logs, t: 'Run Log' },
  { sec: 'Operate' },
  { p: 'operators', ic: Icons.people, t: 'Operators', badge: '610' },
  { p: 'ingest', ic: Icons.upload, t: 'Ingest' },
  { p: 'config', ic: Icons.sliders, t: 'Configuration' },
  { sec: 'Design' },
  { p: 'architecture', ic: Icons.blueprint, t: 'Architecture' },
];

const BREADCRUMB_MAP: Record<string, string> = {
  overview: 'Overview',
  funnel: 'Funnel',
  health: 'Health',
  logs: 'Run Log',
  operators: 'Operators',
  ingest: 'Ingest',
  config: 'Configuration',
  architecture: 'Pipeline Architecture',
  design: 'Design System',
};

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { autoRefresh, setAutoRefresh } = useAutoRefresh();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Alerts state
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Client-side auth protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
      setSearchLoading(false);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch alerts on mount and every 30 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/alerts`);
        const data = await res.json();
        setAlerts(data);
      } catch (error) {
        console.error('Alerts error:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // ⌘K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search input') as HTMLInputElement;
        searchInput?.focus();
      }
      // ESC to close search results
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setShowAlerts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show nothing while checking auth
  if (loading || !user) {
    return null;
  }

  // Get current page from pathname
  const currentPage = pathname.split('/dashboard/')[1] || 'overview';
  const breadcrumb = BREADCRUMB_MAP[currentPage] || currentPage;

  // Get user initials
  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 17l5-5-5-5M12 19h8"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="brand-name">Cendra</div>
            <div className="brand-sub">GTM Engine</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav">
          {NAV.map((item, index) => {
            if ('sec' in item) {
              return (
                <div key={index} className="nav-label">
                  {item.sec}
                </div>
              );
            }

            const isActive = currentPage === item.p;

            return (
              <Link
                key={item.p}
                href={`/dashboard/${item.p}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="ic">{item.ic}</span>
                {item.t}
                {item.badge && (
                  <span className={`nav-badge ${item.alert ? 'alert' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{getUserInitials()}</div>
            <div>
              <div className="nm">{user?.name || 'User'}</div>
              <div className="rl">{user?.role || 'SALES OPS'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn ghost sm"
            style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
          >
            <span className="ic">{Icons.logout}</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="crumbs">
            <span>Engine</span>
            <span className="sep">/</span>
            <span className="here">{breadcrumb}</span>
          </div>

          {/* Search */}
          <div className="search" style={{ position: 'relative' }}>
            {Icons.search}
            <input
              placeholder="Search operators, domains, runs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setShowSearchResults(true)}
            />
            <kbd>⌘K</kbd>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults && (
              <div
                className="search-results"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 100,
                }}
              >
                {searchLoading ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Searching...
                  </div>
                ) : searchResults.total === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No results found
                  </div>
                ) : (
                  <>
                    {/* Operators */}
                    {searchResults.operators.length > 0 && (
                      <div>
                        <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Operators ({searchResults.operators.length})
                        </div>
                        {searchResults.operators.map((op: any) => (
                          <a
                            key={op.id}
                            href={`/dashboard/operators?id=${op.id}`}
                            onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                            style={{
                              display: 'block',
                              padding: '10px 12px',
                              borderTop: '1px solid var(--border)',
                              textDecoration: 'none',
                              color: 'var(--text)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{op.domain}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {op.email || op.name || 'No contact'}
                              {op.score && <span style={{ marginLeft: '8px' }}>• Score: {op.score}</span>}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Pipeline Runs */}
                    {searchResults.runs.length > 0 && (
                      <div>
                        <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Runs ({searchResults.runs.length})
                        </div>
                        {searchResults.runs.map((run: any) => (
                          <a
                            key={run.id}
                            href="/dashboard/logs"
                            onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                            style={{
                              display: 'block',
                              padding: '10px 12px',
                              borderTop: '1px solid var(--border)',
                              textDecoration: 'none',
                              color: 'var(--text)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{run.stage}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {new Date(run.started_at).toLocaleString()}
                              <span style={{ marginLeft: '8px' }}>• {run.rows_succeeded}/{run.rows_claimed} succeeded</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Top Right */}
          <div className="top-right">
            {/* Live Status */}
            <div className="live">
              <span className="dot"></span>
              Scheduler <b>running</b> · next{' '}
              <span className="mono">clean 4m</span>
            </div>

            {/* Auto Refresh Toggle */}
            <label className="refresh-toggle">
              <span className="switch" style={{ width: '34px', height: '20px' }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="tk"></span>
              </span>
              Live
            </label>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                onClick={() => setShowAlerts(!showAlerts)}
                style={{ position: 'relative' }}
              >
                {Icons.bell}
                {alerts.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      background: 'var(--bad)',
                      borderRadius: '50%',
                      border: '2px solid var(--bg)',
                    }}
                  />
                )}
              </button>

              {/* Alerts Dropdown */}
              {showAlerts && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '380px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    zIndex: 100,
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Alerts</h3>
                    {alerts.length > 0 && (
                      <button
                        onClick={() => setAlerts([])}
                        style={{
                          fontSize: '11px',
                          color: 'var(--brand)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Alerts List */}
                  {alerts.length === 0 ? (
                    <div
                      style={{
                        padding: '32px 16px',
                        textAlign: 'center',
                        color: 'var(--text-dim)',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ marginBottom: '8px', fontSize: '32px' }}>✓</div>
                      No alerts
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const alertColors: Record<string, string> = {
                        error: '#EF4444',
                        warning: '#F59E0B',
                        info: '#38BDF8',
                      };
                      const iconMap: Record<string, string> = {
                        error: '⚠️',
                        warning: '⚡',
                        info: 'ℹ️',
                      };

                      return (
                        <a
                          key={alert.id}
                          href={alert.link}
                          onClick={() => setShowAlerts(false)}
                          style={{
                            display: 'block',
                            padding: '12px 16px',
                            borderTop: '1px solid var(--border)',
                            textDecoration: 'none',
                            color: 'var(--text)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div
                              style={{
                                fontSize: '18px',
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            >
                              {iconMap[alert.type]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                                {alert.title}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                                {alert.message}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>
                                {new Date(alert.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

// Wrap with AutoRefreshProvider
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AutoRefreshProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AutoRefreshProvider>
  );
}
