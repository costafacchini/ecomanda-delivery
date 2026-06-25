import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getDashboardMessageVolume } from '../../../services/dashboard'
import type { IDashboardMessageVolume, IDashboardMessageVolumeRow } from '../../../types'

const today = () => new Date().toISOString().split('T')[0]
const firstDayOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

function buildHourAverages(perHour: IDashboardMessageVolumeRow[]) {
  const hourMap: Record<string, number[]> = {}
  for (const row of perHour) {
    const hour = row._id?.split('T')[1]
    if (!hour) continue
    if (!hourMap[hour]) hourMap[hour] = []
    hourMap[hour].push(row.count)
  }
  return Object.entries(hourMap)
    .map(([hour, counts]) => ({ hour, avg: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)
    .sort((a, b) => a.hour.localeCompare(b.hour))
}

export default function SuperMessageVolumeCard({ licensee }: { licensee?: string }) {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(firstDayOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<IDashboardMessageVolume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardMessageVolume({ ...(licensee ? { licensee } : {}), startDate, endDate })
      .then((res) => setData(res.data as IDashboardMessageVolume))
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoading(false))
  }, [licensee, startDate, endDate, retryCount, t])

  const hourAverages = useMemo(() => buildHourAverages(data?.per_hour || []), [data])

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>{t('dashboard.messageVolume.cardTitle')}</span>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              aria-label={t('dashboard.dateFrom')}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-muted small">{t('dashboard.dateUntil')}</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              aria-label={t('dashboard.dateTo')}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading && (
          <p className="text-muted">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            {t('common.loading')}
          </p>
        )}
        {error && (
          <div>
            <p className="text-danger mb-2">{error}</p>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRetryCount((c) => c + 1)}>
              {t('dashboard.retry')}
            </button>
          </div>
        )}
        {data && (
          <>
            <div className="d-flex gap-4 mb-3">
              <div>
                <div className="fs-4 fw-bold">{data.peak_throughput}</div>
                <div className="text-muted small">{t('dashboard.messageVolume.peakLabel')}</div>
              </div>
              <div>
                <div className="fs-4 fw-bold">{data.avg_transfer_rate}</div>
                <div className="text-muted small">{t('dashboard.messageVolume.avgLabel')}</div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="fw-semibold mb-1 small">{t('dashboard.messageVolume.perDayTitle')}</div>
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>{t('dashboard.messageVolume.colDate')}</th>
                      <th>{t('dashboard.messageVolume.colTotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.per_day || []).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted">{t('dashboard.noData')}</td>
                      </tr>
                    ) : (data.per_day || []).map((row: IDashboardMessageVolumeRow) => (
                      <tr key={row._id}>
                        <td>{row._id}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="col-6">
                <div className="fw-semibold mb-1 small">{t('dashboard.messageVolume.perHourTitle')}</div>
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>{t('dashboard.messageVolume.colHour')}</th>
                      <th>{t('dashboard.messageVolume.colAvg')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hourAverages.map(({ hour, avg }) => (
                      <tr key={hour}>
                        <td>{hour}h</td>
                        <td>{avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
