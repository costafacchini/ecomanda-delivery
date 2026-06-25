import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment-timezone'
import { getMessages, resendMessage, ignoreMessage } from '../../../services/message'

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

function formatDate(value: string | undefined): string {
  if (!value) return '—'
  return moment(value).tz(tz).format('DD/MM/YYYY HH:mm:ss')
}

interface IFailedMessage {
  _id: string
  text?: string
  error?: string
  createdAt?: string
  contact?: { number?: string }
}

interface FailedMessagesModalProps {
  isOpen: boolean
  onClose: () => void
  onResendSuccess: () => void
  onIgnoreSuccess?: () => void
  startDate?: string
  endDate?: string
  licensee?: string
}

export default function FailedMessagesModal({ isOpen, onClose, onResendSuccess, onIgnoreSuccess, startDate, endDate, licensee }: FailedMessagesModalProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<IFailedMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set())
  const [ignoringIds, setIgnoringIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setFetchError(null)
    setRowErrors({})

    const params: Record<string, unknown> = { sended: false, limit: 50 }
    if (startDate) params.startDate = moment.tz(startDate, tz).startOf('day').utc().toISOString()
    if (endDate) params.endDate = moment.tz(endDate, tz).endOf('day').utc().toISOString()
    if (licensee) params.licensee = licensee

    getMessages(params)
      .then((res) => setMessages(res.data as unknown as IFailedMessage[]))
      .catch(() => setFetchError(t('dashboard.failedMessages.fetchError')))
      .finally(() => setLoading(false))
  }, [isOpen, startDate, endDate, licensee, t])

  function handleResend(id: string) {
    setResendingIds((prev) => new Set(prev).add(id))
    resendMessage(id)
      .then(() => {
        setMessages((prev) => prev.filter((m) => m._id !== id))
        setResendingIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        setRowErrors((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        onResendSuccess()
      })
      .catch(() => {
        setResendingIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        setRowErrors((prev) => ({ ...prev, [id]: t('dashboard.failedMessages.resendError') }))
      })
  }

  function handleIgnore(id: string) {
    setIgnoringIds((prev) => new Set(prev).add(id))
    ignoreMessage(id)
      .then(() => {
        setMessages((prev) => prev.filter((m) => m._id !== id))
        setIgnoringIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        setRowErrors((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        onIgnoreSuccess?.()
      })
      .catch(() => {
        setIgnoringIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        setRowErrors((prev) => ({ ...prev, [id]: t('dashboard.failedMessages.ignoreError') }))
      })
  }

  if (!isOpen) return null

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('dashboard.failedMessages.modalTitle')}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label={t('dashboard.failedMessages.closeButton')} />
          </div>
          <div className="modal-body">
            {loading && (
              <p className="text-muted">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                {t('common.loading')}
              </p>
            )}
            {fetchError && <p className="text-danger">{fetchError}</p>}
            {!loading && !fetchError && messages.length === 0 && (
              <p className="text-muted">{t('dashboard.failedMessages.noMessages')}</p>
            )}
            {!loading && !fetchError && messages.length > 0 && (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>{t('dashboard.failedMessages.colContact')}</th>
                    <th>{t('dashboard.failedMessages.colDateTime')}</th>
                    <th>{t('dashboard.failedMessages.colMessage')}</th>
                    <th>{t('dashboard.failedMessages.colError')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg._id}>
                      <td>{msg.contact?.number || '—'}</td>
                      <td className="text-nowrap">{formatDate(msg.createdAt)}</td>
                      <td>{msg.text ? msg.text.slice(0, 80) : '—'}</td>
                      <td className="text-danger small" style={{ wordBreak: 'break-word' }}>{msg.error || '—'}</td>
                      <td>
                        {rowErrors[msg._id] && (
                          <span className="text-danger small me-2">{rowErrors[msg._id]}</span>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          disabled={resendingIds.has(msg._id) || ignoringIds.has(msg._id)}
                          onClick={() => handleResend(msg._id)}
                        >
                          {resendingIds.has(msg._id) ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                              {t('dashboard.failedMessages.resending')}
                            </>
                          ) : t('dashboard.failedMessages.resendButton')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={resendingIds.has(msg._id) || ignoringIds.has(msg._id)}
                          onClick={() => handleIgnore(msg._id)}
                        >
                          {ignoringIds.has(msg._id) ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                              {t('dashboard.failedMessages.ignoring')}
                            </>
                          ) : t('dashboard.failedMessages.ignoreButton')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('dashboard.failedMessages.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
