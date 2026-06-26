'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Badge from '@/components/badge'
import * as Icons from '@/components/icons'
import { fetcher } from '@/lib/api'

// Keep mock data as fallback
const OPERATORS = [
  {
    id: 'op_4471',
    dom: 'coastalcasacollective.com',
    co: 'Coastal Casa Collective',
    ct: 'Marina Albright',
    status: 'synced',
    tier: 'clay_full',
    sc: 84,
    band: 'A',
    synced: true,
  },
  {
    id: 'op_4458',
    dom: 'sierravistarentals.com',
    co: 'Sierra Vista Rentals',
    ct: 'Tomás Iglesias',
    status: 'qualified',
    tier: 'clay_email',
    sc: 68,
    band: 'B',
    synced: false,
  },
  {
    id: 'op_4502',
    dom: 'pairadise.lodgify.com',
    co: 'Pairadise Stays',
    ct: null,
    status: 'no_custom_domain',
    tier: null,
    sc: 0,
    band: null,
    synced: false,
  },
  {
    id: 'op_4399',
    dom: 'blueheronvillas.com',
    co: 'Blue Heron Villas',
    ct: 'Priya Nair',
    status: 'synced',
    tier: 'clay_full',
    sc: 91,
    band: 'A',
    synced: true,
  },
  {
    id: 'op_4480',
    dom: 'altstadt-apartments.de',
    co: 'Altstadt Apartments',
    ct: 'Lena Brandt',
    status: 'clay_sent',
    tier: null,
    sc: 0,
    band: null,
    synced: false,
  },
  {
    id: 'op_4465',
    dom: 'goldenpinecabins.com',
    co: 'Golden Pine Cabins',
    ct: 'Robert Hale',
    status: 'disqualified',
    tier: 'clay_no_data',
    sc: 34,
    band: 'C',
    synced: false,
  },
  {
    id: 'op_4511',
    dom: 'amalficoastescapes.it',
    co: 'Amalfi Coast Escapes',
    ct: 'Giulia Romano',
    status: 'clay_pending',
    tier: null,
    sc: 0,
    band: null,
    synced: false,
  },
  {
    id: 'op_4423',
    dom: 'desertbloomstays.com',
    co: 'Desert Bloom Stays',
    ct: 'Hannah Cole',
    status: 'synced',
    tier: 'clay_email',
    sc: 72,
    band: 'B',
    synced: true,
  },
  {
    id: 'op_4490',
    dom: 'fjordviewlodges.no',
    co: 'Fjordview Lodges',
    ct: null,
    status: 'ready_to_enrich',
    tier: null,
    sc: 0,
    band: null,
    synced: false,
  },
  {
    id: 'op_4444',
    dom: 'havenhouserentals.com',
    co: 'Haven House Rentals',
    ct: 'Marcus Webb',
    status: 'qualified',
    tier: 'clay_phone',
    sc: 61,
    band: 'B',
    synced: false,
  },
  {
    id: 'op_4408',
    dom: 'tuscanhillretreats.com',
    co: 'Tuscan Hill Retreats',
    ct: 'Elena Bianchi',
    status: 'enriched',
    tier: 'clay_full',
    sc: 0,
    band: null,
    synced: false,
  },
  {
    id: 'op_4385',
    dom: 'rentmybeachpad.weebly.com',
    co: 'Beach Pad Rentals',
    ct: null,
    status: 'not_str',
    tier: null,
    sc: 0,
    band: null,
    synced: false,
  },
]

const STATUS_COUNTS = [
  ['synced', 128],
  ['qualified', 41],
  ['enriched', 18],
  ['clay_sent', 24],
  ['clay_pending', 38],
  ['ready_to_enrich', 73],
  ['disqualified', 96],
  ['no_custom_domain', 52],
]

const TIER_FILTERS = ['clay_full', 'clay_email', 'clay_phone', 'clay_linkedin', 'clay_no_data']
const NAME_SOURCES = ['website', 'email_name', 'snov', 'leadmagic', 'clay']

export default function OperatorsPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [scoreThreshold, setScoreThreshold] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const limit = 50

  // Fetch operators from API
  const { data, error, isLoading } = useSWR(
    `/api/data/operators?limit=${limit}&offset=${currentPage * limit}${searchQuery ? `&search=${searchQuery}` : ''}`,
    fetcher,
    { refreshInterval: 30000 } // Auto-refresh every 30 seconds
  )

  const operators = data?.operators || OPERATORS
  const total = data?.total || OPERATORS.length

  const getScoreColor = (score: number, band: string | null) => {
    if (score >= 70) return '#35D399'
    if (score >= 55) return '#5FD0C0'
    if (score > 0) return '#F5B13D'
    return '#5E6E83'
  }

  const getScoreBgColor = (band: string | null) => {
    if (band === 'A') return 'rgba(53,211,153,.15)'
    if (band === 'B') return 'rgba(95,208,192,.15)'
    return 'rgba(245,177,61,.15)'
  }

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Records</div>
          <div className="h1">Operators</div>
          <div className="sub">
            Search, filter, and drill into any operator to see its full enrichment journey, contact
            provenance, and ICP score breakdown.
          </div>
        </div>
        <div className="head-actions">
          <button className="btn ghost">
            <Icons.Download />
            Export view
          </button>
          <button className="btn">
            <Icons.Plus />
            Add operators
          </button>
        </div>
      </div>

      <div className="ops-layout">
        {/* Filter Rail */}
        <div className="card pad filter-rail">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div className="card-title" style={{ fontSize: '13px' }}>
              <Icons.Filter />
              Filters
            </div>
            <button className="btn ghost sm">Reset</button>
          </div>

          {/* Status Filters */}
          <div className="fr-group">
            <div className="fr-title">Status</div>
            {STATUS_COUNTS.map(([status, count], i) => (
              <label key={status} className="chk">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStatuses([...selectedStatuses, status])
                    } else {
                      setSelectedStatuses(selectedStatuses.filter(s => s !== status))
                    }
                  }}
                />
                <Badge label={status.replace(/_/g, ' ')} statusKey={status} />
                <span className="ct">{count}</span>
              </label>
            ))}
          </div>

          {/* Enrichment Tier Filters */}
          <div className="fr-group">
            <div className="fr-title">Enrichment tier</div>
            {TIER_FILTERS.map(tier => (
              <label key={tier} className="chk">
                <input type="checkbox" />
                <Badge label={tier.replace(/_/g, ' ')} statusKey={tier} />
              </label>
            ))}
          </div>

          {/* Score Range */}
          <div className="fr-group">
            <div className="fr-title">Score range</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-mute)' }}>
              <span>0</span>
              <input
                type="range"
                min="0"
                max="100"
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ color: 'var(--brand-bright)' }}>{scoreThreshold}+</span>
            </div>
          </div>

          {/* Name Source */}
          <div className="fr-group">
            <div className="fr-title">Name source</div>
            {NAME_SOURCES.map(source => (
              <label key={source} className="chk">
                <input type="checkbox" />
                <span style={{ fontSize: '12.5px' }}>{source}</span>
              </label>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="fr-group" style={{ border: 'none' }}>
            <label className="chk">
              <input type="checkbox" />
              Qualified only
            </label>
            <label className="chk">
              <input type="checkbox" />
              Synced to Attio
            </label>
          </div>
        </div>

        {/* Main Table */}
        <div className="card">
          <div className="card-head">
            <div className="search" style={{ margin: 0, maxWidth: '340px', flex: 1 }}>
              <Icons.Search />
              <input
                placeholder="Domain, company, email, contact…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(0) // Reset to first page on search
                }}
              />
            </div>
            <div className="card-meta">
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  Showing <b style={{ color: 'var(--text)' }}>{operators.length}</b> of {total}
                </>
              )}
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="sortable">
                    Domain <span className="arr">↕</span>
                  </th>
                  <th className="sortable">Company</th>
                  <th>Contact</th>
                  <th className="sortable">Status</th>
                  <th>Tier</th>
                  <th className="sortable">Score</th>
                  <th style={{ textAlign: 'center' }}>Attio</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                      Loading operators...
                    </td>
                  </tr>
                ) : operators.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                      No operators found
                    </td>
                  </tr>
                ) : (
                  operators.map((op: any) => (
                    <tr key={op.id} className="clickable">
                      <td>
                        <div className="dom">{op.domain || op.dom}</div>
                        <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                          {op.id}
                        </div>
                      </td>
                      <td className="cell-strong">{op.company_name || op.co}</td>
                      <td>
                        {op.contact_name || op.ct ? (
                          <span style={{ fontSize: '12.5px' }}>{op.contact_name || op.ct}</span>
                        ) : (
                          <span className="cell-dim mono">—</span>
                        )}
                      </td>
                      <td>
                        <Badge label={(op.status || 'raw').replace(/_/g, ' ')} statusKey={op.status || 'raw'} />
                      </td>
                      <td>
                        {op.tier ? (
                          <Badge label={op.tier.replace(/_/g, ' ')} statusKey={op.tier} />
                        ) : (
                          <span className="cell-dim mono" style={{ fontSize: '11px' }}>—</span>
                        )}
                      </td>
                      <td style={{ width: '54px' }}>
                        {op.icp_score && op.icp_score > 0 ? (
                          <span
                            className="score-chip"
                            style={{
                              background: getScoreBgColor(op.score_band || null),
                              color: getScoreColor(op.icp_score, op.score_band || null),
                            }}
                          >
                            {op.icp_score}
                          </span>
                        ) : (
                          <span className="cell-dim">—</span>
                        )}
                      </td>
                      <td style={{ width: '50px', textAlign: 'center' }}>
                        {op.attio_list_entry_id || op.synced ? (
                        <span style={{ color: 'var(--synced)' }}>
                          <Icons.Check />
                        </span>
                      ) : (
                        <span className="cell-dim mono">—</span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>

            {/* Pagination */}
            {!isLoading && total > limit && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Showing {currentPage * limit + 1} - {Math.min((currentPage + 1) * limit, total)} of {total} operators
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn sm ghost"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn sm ghost"
                    disabled={(currentPage + 1) * limit >= total}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
