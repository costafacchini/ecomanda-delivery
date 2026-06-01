import { useState, useEffect } from 'react'
import { getMessages, resendMessage } from '../../../services/message'

export default function FailedMessagesModal({ isOpen, onClose, onResendSuccess }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<any>(null)
  const [rowErrors, setRowErrors] = useState<any>({})

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setFetchError(null)
    setRowErrors({})

    getMessages({ sended: false, limit: 50 })
      .then((res) => setMessages(res.data))
      .catch(() => setFetchError('Erro ao carregar mensagens falhas.'))
      .finally(() => setLoading(false))
  }, [isOpen])

  function handleResend(id: any) {
    resendMessage(id)
      .then(() => {
        setMessages((prev: any) => prev.filter((m: any) => m._id !== id))
        setRowErrors((prev: any) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        onResendSuccess()
      })
      .catch(() => {
        setRowErrors((prev: any) => ({ ...prev, [id]: 'Erro ao reenviar.' }))
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
      <div className="modal-dialog modal-lg" role="document">
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
                    <th>Mensagem</th>
                    <th>Erro</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg._id}>
                      <td>{msg.contact?.number || '—'}</td>
                      <td>{msg.text ? msg.text.slice(0, 80) : '—'}</td>
                      <td className="text-danger small">{msg.error || '—'}</td>
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
