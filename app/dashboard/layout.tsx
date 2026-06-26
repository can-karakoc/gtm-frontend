'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

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
  { sec: 'System' },
  { p: 'design', ic: Icons.swatch, t: 'Design System' },
];

const BREADCRUMB_MAP: Record<string, string> = {
  overview: 'Overview',
  funnel: 'Funnel',
  health: 'Health',
  logs: 'Run Log',
  operators: 'Operators',
  ingest: 'Ingest',
  config: 'Configuration',
  design: 'Design System',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get current page from pathname
  const currentPage = pathname.split('/dashboard/')[1] || 'overview';
  const breadcrumb = BREADCRUMB_MAP[currentPage] || currentPage;

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
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
          <div className="search">
            {Icons.search}
            <input placeholder="Search operators, domains, runs…" />
            <kbd>⌘K</kbd>
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
            <button className="icon-btn">{Icons.bell}</button>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
