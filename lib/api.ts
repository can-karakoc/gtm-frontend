/**
 * API Client for GTM Engine
 * Fetches data from FastAPI backend
 */

// Use environment variable, fallback to production backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gtm-pipeline.fly.dev'

/**
 * Generic API fetcher with authorization
 */
export async function fetcher<T = any>(url: string): Promise<T> {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('gtm_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${url}`, {
    headers
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
