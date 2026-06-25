import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDashboardConversations } from '../../../services/dashboard'
import type { IDashboardConversations } from '../../../types'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const today = () => new Date().toISOString().split('T')[0]
const firstDayOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

export default function SuperConversationsCard({ licensee }: { licensee?: string }) {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(firstDayOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<IDashboardConversations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardConversations({ ...(licensee ? { licensee } : {}), startDate, endDate })
      .then((res) => setData(res.data as IDashboardConversations))
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoading(false))
  }, [licensee, startDate, endDate, retryCount, t])

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>{t('dashboard.conversations.cardTitle')}</span>
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
          <div className="d-flex gap-4">
            <div>
              <div className="fs-4 fw-bold text-success">{data.started_today}</div>
              <div className="text-muted small">{t('dashboard.conversations.startedLabel')}</div>
            </div>
            <div>
              <div className="fs-4 fw-bold">{data.ended_today}</div>
              <div className="text-muted small">{t('dashboard.conversations.endedLabel')}</div>
            </div>
            <div>
              <div className="fs-4 fw-bold">{data.avg_messages_per_conversation}</div>
              <div className="text-muted small">{t('dashboard.conversations.avgMsgLabel')}</div>
            </div>
            <div>
              <div className="fs-4 fw-bold">{formatDuration(data.avg_duration_seconds ?? 0)}</div>
              <div className="text-muted small">{t('dashboard.conversations.avgDurationLabel')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
