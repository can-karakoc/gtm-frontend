/**
 * API Client for GTM Engine
 * Fetches data from FastAPI backend
 */

// Use environment variable, fallback to production backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gtm-pipeline.fly.dev'

/**
 * Generic API fetcher with credentials
 */
export async function fetcher<T = any>(url: string): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    credentials: 'include', // Include cookies for auth
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Dashboard API endpoints
 */
export const api = {
  // KPIs for overview
  getKPIs: () => fetcher('/api/data/kpis'),

  // Pipeline stage counts
  getPipelineCounts: () => fetcher('/api/data/pipeline-counts'),

  // Stage health
  getStageHealth: () => fetcher('/api/data/stage-health'),

  // Recent runs
  getRecentRuns: (limit = 10) => fetcher(`/api/data/recent-runs?limit=${limit}`),

  // Operators list
  getOperators: (params?: {
    limit?: number
    offset?: number
    status?: string
    search?: string
  }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetcher(`/api/data/operators${query ? `?${query}` : ''}`)
  },

  // Single operator
  getOperator: (id: number) => fetcher(`/api/data/operators/${id}`),

  // Status distribution
  getStatusDistribution: () => fetcher('/api/data/stats/status-distribution')
}
