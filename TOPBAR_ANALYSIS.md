# Dashboard Topbar Analysis

**File:** `/app/dashboard/layout.tsx`  
**Components:** Search bar, Live toggle, Scheduler status, Alerts icon

---

## 1. Search Bar (⌘K)

**Location:** Line 240-245

```tsx
<div className="search">
  {Icons.search}
  <input placeholder="Search operators, domains, runs…" />
  <kbd>⌘K</kbd>
</div>
```

### Status: ❌ **Not Functional**

**Current Behavior:**
- Renders a visual input field
- No `onChange` handler
- No `onKeyDown` handler for ⌘K shortcut
- No search state management
- Purely decorative UI element

**What It Should Do:**
- Accept keyboard input
- Listen for ⌘K (Cmd+K) shortcut to focus
- Trigger search across:
  - Operators (by domain, email, name)
  - Run logs (by stage, status)
  - Configuration settings
- Show search results dropdown
- Navigate to selected result

**Implementation Needed:**
```tsx
const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState([])
const [showResults, setShowResults] = useState(false)

// ⌘K shortcut handler
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault()
      searchInputRef.current?.focus()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])

// Search API call
const handleSearch = async (query: string) => {
  setSearchQuery(query)
  if (query.length < 2) {
    setSearchResults([])
    return
  }
  
  const results = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  setSearchResults(await results.json())
  setShowResults(true)
}

<input 
  ref={searchInputRef}
  value={searchQuery}
  onChange={(e) => handleSearch(e.target.value)}
  placeholder="Search operators, domains, runs…" 
/>
```

**Backend API Needed:**
```python
# api/routes/search.py
@router.get("/search")
async def search(q: str):
    sb = get_sb()
    
    # Search operators
    operators = sb.table("operators").select("*").or_(
        f"domain.ilike.%{q}%,email.ilike.%{q}%,contact_name.ilike.%{q}%"
    ).limit(10).execute()
    
    # Search runs
    runs = sb.table("pipeline_runs").select("*").ilike("stage", f"%{q}%").limit(5).execute()
    
    return {
        "operators": operators.data,
        "runs": runs.data,
        "total": len(operators.data) + len(runs.data)
    }
```

---

## 2. Live Toggle (Auto-Refresh)

**Location:** Line 256-267

```tsx
const [autoRefresh, setAutoRefresh] = useState(true);

<label className="refresh-toggle">
  <span className="switch">
    <input
      type="checkbox"
      checked={autoRefresh}
      onChange={(e) => setAutoRefresh(e.target.checked)}
    />
    <span className="tk"></span>
  </span>
  Live
</label>
```

### Status: ⚠️ **Partially Functional**

**Current Behavior:**
- State changes when toggled (`autoRefresh` boolean updates)
- Visual toggle works (switch animates)
- **BUT**: State is not used anywhere else in the app
- No effect on data fetching/polling

**What It Should Do:**
- Enable/disable automatic data refresh
- When ON: Poll API every 10-30 seconds for fresh data
- When OFF: Only fetch data on mount (manual refresh only)
- Persist preference to localStorage

**Implementation Needed:**

**In `layout.tsx`:**
```tsx
// Load preference from localStorage
const [autoRefresh, setAutoRefresh] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('autoRefresh') !== 'false'
  }
  return true
})

// Save preference
const handleToggle = (checked: boolean) => {
  setAutoRefresh(checked)
  localStorage.setItem('autoRefresh', String(checked))
}

// Pass to children via context
<AutoRefreshContext.Provider value={{ autoRefresh }}>
  {children}
</AutoRefreshContext.Provider>
```

**In pages (e.g., `overview/page.tsx`):**
```tsx
import { useAutoRefresh } from '@/lib/auto-refresh-context'

const { autoRefresh } = useAutoRefresh()

const { data: kpisData } = useSWR(
  '/api/data/kpis', 
  fetcher,
  {
    refreshInterval: autoRefresh ? 10000 : 0, // 10s when Live, 0 when OFF
    revalidateOnFocus: autoRefresh,
  }
)
```

**Files to Create:**
```tsx
// lib/auto-refresh-context.tsx
import { createContext, useContext } from 'react'

const AutoRefreshContext = createContext({ autoRefresh: true })

export const useAutoRefresh = () => useContext(AutoRefreshContext)
export default AutoRefreshContext
```

---

## 3. Scheduler Status (Green Dot)

**Location:** Line 249-254

```tsx
<div className="live">
  <span className="dot"></span>
  Scheduler <b>running</b> · next{' '}
  <span className="mono">clean 4m</span>
</div>
```

### Status: ❌ **Hardcoded (Static)**

**Current Behavior:**
- Shows "running" status (always)
- Shows "next clean 4m" (never updates)
- Green pulsing dot (always green)
- Purely static HTML

**What It Should Do:**
- Fetch real-time scheduler status from backend
- Show actual next stage + countdown
- Update every second (countdown timer)
- Show different states:
  - ✅ **running** (green) - Scheduler active
  - ⚠️ **paused** (yellow) - Manually stopped
  - ❌ **error** (red) - Crash or failure
- Show actual next stage name (clean, name_enrich, score, etc.)

**Implementation Needed:**

**Backend API:**
```python
# api/routes/data.py
@router.get("/scheduler-status")
async def get_scheduler_status():
    """Get real-time scheduler status from service"""
    # Option 1: Query pipeline_config for enabled stages
    config = sb.table("pipeline_config").select("*").eq("id", 1).single().execute()
    
    # Option 2: Call Fly.io service health endpoint
    # response = httpx.get("https://gtm-pipeline.fly.dev/scheduler-status")
    
    # Find next stage from most recent run
    last_run = sb.table("pipeline_runs").select("stage,finished_at").order("finished_at", desc=True).limit(1).single().execute()
    
    # Calculate next stage based on intervals
    stages = ["clean", "name_enrich", "score", "sync"]
    intervals = {"clean": 300, "name_enrich": 600, "score": 300, "sync": 900}  # seconds
    
    next_stage = stages[(stages.index(last_run.data["stage"]) + 1) % len(stages)]
    next_in_seconds = intervals[next_stage] - (time.time() - last_run.data["finished_at"])
    
    return {
        "status": "running",  # or "paused", "error"
        "next_stage": next_stage,
        "next_in_seconds": max(0, next_in_seconds)
    }
```

**Frontend:**
```tsx
const [schedulerStatus, setSchedulerStatus] = useState({
  status: 'running',
  next_stage: 'clean',
  next_in_seconds: 240
})

// Poll every second
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/api/data/scheduler-status')
    const data = await res.json()
    setSchedulerStatus(data)
  }, 1000)
  
  return () => clearInterval(interval)
}, [])

// Format countdown
const formatCountdown = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  return `${mins}m`
}

<div className="live">
  <span className={`dot ${schedulerStatus.status}`}></span>
  Scheduler <b>{schedulerStatus.status}</b> · next{' '}
  <span className="mono">
    {schedulerStatus.next_stage} {formatCountdown(schedulerStatus.next_in_seconds)}
  </span>
</div>
```

**CSS for states:**
```css
.live .dot { background: var(--good); }  /* green - running */
.live .dot.paused { background: var(--warn); }  /* yellow */
.live .dot.error { background: var(--bad); }  /* red */
```

---

## 4. Alerts Icon (Bell)

**Location:** Line 270

```tsx
<button className="icon-btn">{Icons.bell}</button>
```

### Status: ❌ **Not Functional**

**Current Behavior:**
- Renders a bell icon button
- No `onClick` handler
- No badge for unread count
- Purely decorative UI element

**What It Should Do:**
- Show notification badge (red dot) when unread alerts exist
- Click to open alerts dropdown/panel
- Display recent alerts:
  - Pipeline failures (e.g., "clean stage failed 2m ago")
  - Budget warnings (e.g., "Clay budget 90% used")
  - Health alerts (e.g., "2 operators in needs_review")
  - Sync issues (e.g., "Attio sync failed")
- Mark as read when clicked
- Link to relevant page (e.g., click "clean failed" → go to Run Log)

**Implementation Needed:**

**Backend API:**
```python
# api/routes/alerts.py
@router.get("/alerts")
async def get_alerts():
    sb = get_sb()
    alerts = []
    
    # Check recent run failures
    failed_runs = sb.table("pipeline_runs").select("*").neq("errors", None).gte("started_at", "now() - interval '1 hour'").execute()
    for run in failed_runs.data:
        alerts.append({
            "id": run["id"],
            "type": "error",
            "title": f"{run['stage']} stage failed",
            "message": run["errors"],
            "timestamp": run["finished_at"],
            "read": False,
            "link": "/dashboard/logs"
        })
    
    # Check Clay budget
    config = sb.table("pipeline_config").select("daily_clay_budget,clay_rows_today").single().execute()
    usage_pct = (config.data["clay_rows_today"] / config.data["daily_clay_budget"]) * 100
    if usage_pct > 80:
        alerts.append({
            "id": "clay-budget",
            "type": "warning",
            "title": "Clay budget warning",
            "message": f"{usage_pct:.0f}% of daily budget used",
            "timestamp": datetime.now().isoformat(),
            "read": False,
            "link": "/dashboard/config"
        })
    
    # Check needs_review count
    needs_review = sb.table("raw_operators").select("id").eq("status", "needs_review").execute()
    if len(needs_review.data) > 10:
        alerts.append({
            "id": "needs-review",
            "type": "info",
            "title": f"{len(needs_review.data)} operators need review",
            "message": "Manual classification required",
            "timestamp": datetime.now().isoformat(),
            "read": False,
            "link": "/dashboard/operators"
        })
    
    return alerts

@router.post("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str):
    # Store in user_alerts table or localStorage
    return {"success": True}
```

**Frontend:**
```tsx
const [showAlerts, setShowAlerts] = useState(false)
const [alerts, setAlerts] = useState([])

const { data: alertsData } = useSWR('/api/alerts', fetcher, {
  refreshInterval: 30000  // Poll every 30s
})

useEffect(() => {
  if (alertsData) setAlerts(alertsData)
}, [alertsData])

const unreadCount = alerts.filter(a => !a.read).length

<div style={{ position: 'relative' }}>
  <button 
    className="icon-btn" 
    onClick={() => setShowAlerts(!showAlerts)}
  >
    {Icons.bell}
    {unreadCount > 0 && (
      <span className="badge-dot">{unreadCount}</span>
    )}
  </button>
  
  {showAlerts && (
    <div className="alerts-dropdown">
      <div className="alerts-header">
        <h3>Alerts</h3>
        <button onClick={() => markAllRead()}>Mark all read</button>
      </div>
      
      {alerts.length === 0 ? (
        <div className="no-alerts">No alerts</div>
      ) : (
        alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`alert-item ${alert.type} ${alert.read ? 'read' : ''}`}
            onClick={() => {
              markAsRead(alert.id)
              router.push(alert.link)
            }}
          >
            <div className="alert-icon">{getAlertIcon(alert.type)}</div>
            <div>
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-time">{formatTime(alert.timestamp)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>
```

**CSS:**
```css
.badge-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--bad);
  border-radius: 50%;
  border: 2px solid var(--bg);
}

.alerts-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-height: 480px;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 100;
}
```

---

## Summary

| Component | Status | Currently Works | Should Work | Priority |
|-----------|--------|----------------|-------------|----------|
| **Search Bar** | ❌ Not functional | Visual only | Search operators/runs, ⌘K shortcut | High |
| **Live Toggle** | ⚠️ Partial | Toggle state changes | Enable/disable auto-refresh | Medium |
| **Scheduler Status** | ❌ Hardcoded | Shows static text | Real-time status + countdown | High |
| **Alerts Icon** | ❌ Not functional | Visual only | Show pipeline alerts, badge count | Medium |

---

## Implementation Priority

### Phase 1: Critical (High Impact)
1. **Scheduler Status** - Users need to know if pipeline is running
2. **Search Bar** - Essential for navigating 600+ operators

### Phase 2: Quality of Life (Medium Impact)
3. **Live Toggle** - Connect to existing `autoRefresh` state
4. **Alerts Icon** - Proactive notifications for failures

---

## Effort Estimates

| Component | Backend API | Frontend Logic | Testing | Total |
|-----------|-------------|----------------|---------|-------|
| Search Bar | 2h (search endpoint) | 3h (UI + keyboard) | 1h | **6h** |
| Live Toggle | 0h (no API needed) | 1h (context + SWR config) | 30m | **1.5h** |
| Scheduler Status | 2h (status endpoint) | 2h (polling + countdown) | 1h | **5h** |
| Alerts Icon | 3h (alerts logic) | 3h (dropdown + state) | 1h | **7h** |

**Total:** ~20 hours for full implementation

---

## Quick Wins (Can Implement Now)

### 1. Live Toggle (15 minutes)
```tsx
// In overview/page.tsx - just add refreshInterval
const { data: kpisData } = useSWR('/api/data/kpis', fetcher, {
  refreshInterval: 10000  // 10 seconds
})
```

### 2. Alerts Badge (Static) (10 minutes)
```tsx
// Add hardcoded badge to show there are alerts
<button className="icon-btn">
  {Icons.bell}
  <span className="badge-dot">2</span>  {/* Temporary */}
</button>
```

### 3. Search Placeholder Improvement (5 minutes)
```tsx
// Add onFocus hint
<input 
  placeholder="Search operators, domains, runs…"
  onFocus={() => alert('Search coming soon!')}
/>
```

---

## Recommendation

**Start with Scheduler Status** - Most valuable for users, shows pipeline health at a glance.

Then **Search Bar** - Critical for usability with 600+ operators.

**Live Toggle** and **Alerts** can wait until core functionality is solid.
