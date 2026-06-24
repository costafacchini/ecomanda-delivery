import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDashboardMessagesToday } from '../../../services/dashboard'
import type { IDashboardMessagesToday } from '../../../types'

export default function LicenseeMessagesTodayCard() {
  const { t } = useTranslation()
  const [data, setData] = useState<IDashboardMessagesToday | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardMessagesToday()
      .then((res) => setData(res.data as IDashboardMessagesToday))
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
      <div className="card-header">{t('dashboard.messagesToday.cardTitle')}</div>
      <div className="card-body">
        <div className="d-flex gap-4">
          <div>
            <div className="fs-4 fw-bold text-success">{data.sent_today}</div>
            <div className="text-muted small">{t('dashboard.messagesToday.sentLabel', { pct: data.sent_pct ?? 0 })}</div>
          </div>
          <div>
            <div className="fs-4 fw-bold text-danger">{data.failed_today}</div>
            <div className="text-muted small">{t('dashboard.messagesToday.failedLabel', { pct: data.failed_pct ?? 0 })}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
