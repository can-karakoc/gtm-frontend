'use client'

import { useState, useRef } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import {
  Upload,
  FileText,
  Check,
  AlertTriangle,
  Clock,
  Zap,
  Shield
} from '@/components/icons'

interface ValidationRow {
  type: 'ok' | 'warn' | 'err'
  message: string
}

interface IngestionStep {
  name: string
  details: string
  status: 'done' | 'active' | 'pending'
}

export default function IngestPage() {
  const [showPreview, setShowPreview] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch ingestion history
  const { data: ingestData } = useSWR('/api/data/ingestion-history', fetcher, {
    refreshInterval: 30000
  })

  // Mock data for preview
  const previewRows = [
    { domain: 'coastalcasacollective.com', company: 'Coastal Casa Collective', email: 'info@coastal…' },
    { domain: 'amalficoastescapes.it', company: 'Amalfi Coast Escapes', email: 'info@amalfi…' },
    { domain: 'fjordviewlodges.no', company: 'Fjordview Lodges', email: 'post@fjord…' },
    { domain: null, company: 'Mountain Cabin Co', email: '—' },
    { domain: 'havenhouserentals.com', company: 'Haven House Rentals', email: 'info@haven…' }
  ]

  const ingestionSteps: IngestionStep[] = [
    { name: 'Parse CSV', details: '312 rows read', status: 'done' },
    { name: 'Auto-detect columns', details: 'domain · company_name · email · phone', status: 'done' },
    { name: 'Validate', details: '4 errors · 29 warnings', status: 'done' },
    { name: 'Dedup vs raw_operators', details: '283 new · 29 existing', status: 'done' }
  ]

  const validationRows: ValidationRow[] = [
    { type: 'ok', message: '312 rows parsed successfully' },
    { type: 'warn', message: '29 duplicate domains — first occurrence kept' },
    { type: 'err', message: '4 rows missing domain — will be skipped' }
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
      setShowPreview(true)
      // TODO: Parse CSV and show real preview
    } else {
      alert('Please select a CSV file')
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleUseSample = () => {
    setShowPreview(true)
  }

  const handleIngest = async () => {
    if (!selectedFile) return

    setIngesting(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      setProgress(100)
      setTimeout(() => {
        setIngesting(false)
        setShowPreview(false)
        setProgress(0)
        setSelectedFile(null)
        alert(`Ingested ${result.inserted} operators (${result.skipped} duplicates skipped)`)
      }, 500)
    } catch (error) {
      console.error('Ingestion failed:', error)
      alert('Ingestion failed. Check console for details.')
      setIngesting(false)
      setProgress(0)
    }
  }

  return (
    <div className="page active">
      <div className="page-head">
        <div>
          <div className="eyebrow">Data intake</div>
          <div className="h1">Ingest</div>
          <div className="sub">
            Upload a CSV of STR operators. Preview, validate, and dedup against the landing zone
            before anything is committed — no surprises downstream.
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className="drop-zone"
        onClick={handleBrowseClick}
        style={{ display: showPreview ? 'none' : 'block' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="dz-ic">
          <Upload size={20} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '15px' }}>
          Drop a CSV here, or click to browse
        </div>
        <div className="muted" style={{ fontSize: '12.5px', marginTop: '6px' }}>
          Streams in chunks · up to 500 MB · auto-detects domain, company_name, email, phone
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div>
          {/* Preview Table and Validation */}
          <div className="two section-gap">
            {/* Preview Table */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <FileText size={16} />
                  Preview
                </div>
                <div className="card-meta">first 5 of 312</div>
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>domain</th>
                      <th>company_name</th>
                      <th>email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        <td className="dom">
                          {row.domain ? (
                            row.domain
                          ) : (
                            <span style={{ color: 'var(--bad)' }}>missing</span>
                          )}
                        </td>
                        <td>{row.company}</td>
                        <td className="cell-mono cell-dim">{row.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation */}
            <div className="card pad">
              <div className="card-title" style={{ fontSize: '13px', marginBottom: '14px' }}>
                <Shield size={16} />
                Validation &amp; dedup
              </div>

              {validationRows.map((row, i) => (
                <div key={i} className={`val-row ${row.type}`}>
                  {row.type === 'ok' && <Check size={16} />}
                  {row.type !== 'ok' && <AlertTriangle size={16} />}
                  {row.message}
                </div>
              ))}

              <div style={{ height: '6px' }}></div>

              {/* Ingestion Steps */}
              {ingestionSteps.map((step, i) => (
                <div key={i} className={`ing-step ${step.status}`}>
                  <div className="ing-num">
                    <Check size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{step.name}</div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
                      {step.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Estimate */}
          <div className="card pad section-gap">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <div className="card-title" style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <Clock size={16} />
                  Impact estimate
                </div>
                <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                  <div>
                    <div className="mono" style={{ fontSize: '22px', fontWeight: 600, color: 'var(--clean)' }}>
                      283
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                      NEW OPERATORS
                    </div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: '22px', fontWeight: 600 }}>
                      ~6.3h
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                      TO CLEAN
                    </div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: '22px', fontWeight: 600 }}>
                      ~14h
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                      TO ATTIO
                    </div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: '22px', fontWeight: 600, color: 'var(--accent)' }}>
                      $1.65
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                      EST. ENRICH COST
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="btn primary"
                onClick={handleIngest}
                disabled={ingesting}
              >
                <Upload size={15} />
                Ingest 283 operators
              </button>
            </div>

            {/* Progress Bar */}
            {ingesting && (
              <div style={{ marginTop: '16px' }}>
                <div className="meter brand">
                  <div
                    className="meter-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '8px' }}>
                  Chunk {Math.ceil(progress / 14)}/7 · inserting…
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ingestion History Table */}
      <div className="card section-gap">
        <div className="card-head">
          <div className="card-title">
            <FileText size={16} />
            Ingestion history
          </div>
          <div className="card-meta">
            {ingestData?.total || 0} total operators ingested
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th>Imported</th>
                <th>Total Rows</th>
                <th>Processed</th>
                <th>Status</th>
                <th>% Complete</th>
              </tr>
            </thead>
            <tbody>
              {ingestData?.batches?.length ? (
                ingestData.batches.map((batch: any, i: number) => {
                  const totalRows = batch.total_rows || 0
                  const processed = batch.promoted + batch.churned + batch.dead + batch.not_str
                  const percentComplete = totalRows > 0 ? Math.round((processed / totalRows) * 100) : 0

                  return (
                    <tr key={i}>
                      <td>
                        <span className="badge" style={{ fontSize: '11px' }}>
                          {batch.category}
                        </span>
                      </td>
                      <td className="cell-mono cell-dim">
                        {new Date(batch.imported_at).toLocaleDateString()}
                      </td>
                      <td className="cell-mono">{totalRows.toLocaleString()}</td>
                      <td className="cell-mono">
                        <span style={{ color: 'var(--good)' }}>{processed.toLocaleString()}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
                          {batch.promoted > 0 && <div>✓ {batch.promoted} promoted</div>}
                          {batch.churned > 0 && <div>↻ {batch.churned} churned</div>}
                          {batch.needs_review > 0 && <div>? {batch.needs_review} review</div>}
                          {batch.dead > 0 && <div>✗ {batch.dead} dead</div>}
                          {batch.not_str > 0 && <div>− {batch.not_str} not STR</div>}
                        </div>
                      </td>
                      <td>
                        <div className="meter sm" style={{ maxWidth: '120px' }}>
                          <div
                            className="meter-fill"
                            style={{
                              width: `${percentComplete}%`,
                              background: percentComplete === 100 ? 'var(--good)' : 'var(--brand)'
                            }}
                          ></div>
                        </div>
                        <div className="mono" style={{ fontSize: '10px', color: 'var(--text-mute)', marginTop: '4px' }}>
                          {percentComplete}%
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No ingestion history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
