import { useState, useEffect } from 'react'
import { getDashboardContacts } from '../../../services/dashboard'
import type { IDashboardContacts } from '../../../types'

export default function LicenseeContactsCard() {
  const [data, setData] = useState<IDashboardContacts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardContacts()
      .then((res) => setData(res.data as IDashboardContacts))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [retryCount])

  if (loading) return (
    <div className="card">
      <div className="card-body text-center py-4 text-muted">
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        Carregando...
      </div>
    </div>
  )

  if (error) return (
    <div className="card">
      <div className="card-body text-center py-3">
        <p className="text-danger mb-2">{error}</p>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRetryCount((c) => c + 1)}>
          Tentar novamente
        </button>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div className="card">
      <div className="card-header">Contatos</div>
      <div className="card-body">
        <div className="d-flex gap-4">
          <div>
            <div className="fs-4 fw-bold">{data.total}</div>
            <div className="text-muted small">Total</div>
          </div>
          <div>
            <div className="fs-4 fw-bold text-info">{data.in_chatbot}</div>
            <div className="text-muted small">No Chatbot</div>
          </div>
        </div>
      </div>
    </div>
  )
}
