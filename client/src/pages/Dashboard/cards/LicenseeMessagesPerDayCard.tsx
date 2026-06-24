import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDashboardMessagesPerDay } from '../../../services/dashboard'
import type { IDashboardMessagesPerDay } from '../../../types'

export default function LicenseeMessagesPerDayCard() {
  const { t } = useTranslation()
  const [data, setData] = useState<IDashboardMessagesPerDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardMessagesPerDay()
      .then((res) => setData(res.data as IDashboardMessagesPerDay))
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoading(false))
  }, [retryCount, t])

  if (loading) return (
    <div className="card">
      <div className="card-body text-center py-4 text-muted">
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        {t('common.loading')}
      </div>
    </div>
  )

  if (error) return (
    <div className="card">
      <div className="card-body text-center py-3">
        <p className="text-danger mb-2">{error}</p>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRetryCount((c) => c + 1)}>
          {t('dashboard.retry')}
        </button>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div className="card">
      <div className="card-header">{t('dashboard.messagesPerDay.cardTitle')}</div>
      <div className="card-body">
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th>{t('dashboard.messagesPerDay.colDate')}</th>
              <th>{t('dashboard.messagesPerDay.colTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {(data.per_day || []).length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center text-muted">{t('dashboard.noData')}</td>
              </tr>
            ) : (data.per_day || []).map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
