import { useState, useEffect } from 'react'
import moment from 'moment-timezone'
import { getMessages, resendMessage } from '../../../services/message'

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
  startDate?: string
  endDate?: string
}

export default function FailedMessagesModal({ isOpen, onClose, onResendSuccess, startDate, endDate }: FailedMessagesModalProps) {
  const [messages, setMessages] = useState<IFailedMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setFetchError(null)
    setRowErrors({})

    const params: Record<string, unknown> = { sended: false, limit: 50 }
    if (startDate) params.startDate = moment.tz(startDate, tz).startOf('day').utc().toISOString()
    if (endDate) params.endDate = moment.tz(endDate, tz).endOf('day').utc().toISOString()

    getMessages(params)
      .then((res) => setMessages(res.data as unknown as IFailedMessage[]))
      .catch(() => setFetchError('Erro ao carregar mensagens falhas.'))
      .finally(() => setLoading(false))
  }, [isOpen, startDate, endDate])

  function handleResend(id: string) {
    resendMessage(id)
      .then(() => {
        setMessages((prev) => prev.filter((m) => m._id !== id))
        setRowErrors((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        onResendSuccess()
      })
      .catch(() => {
        setRowErrors((prev) => ({ ...prev, [id]: 'Erro ao reenviar.' }))
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
            <h5 className="modal-title">Mensagens com Falha</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
          </div>
          <div className="modal-body">
            {loading && <p>Carregando...</p>}
            {fetchError && <p className="text-danger">{fetchError}</p>}
            {!loading && !fetchError && messages.length === 0 && (
              <p className="text-muted">Nenhuma mensagem com falha.</p>
            )}
            {!loading && !fetchError && messages.length > 0 && (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Contato</th>
                    <th>Data/Hora</th>
                    <th>Mensagem</th>
                    <th>Erro</th>
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
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleResend(msg._id)}
                        >
                          Reenviar
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
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
