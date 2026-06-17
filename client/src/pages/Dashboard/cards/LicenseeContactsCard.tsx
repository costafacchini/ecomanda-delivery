import { useState, useEffect } from 'react'
import { getDashboardContacts } from '../../../services/dashboard'
import type { IDashboardContacts } from '../../../types'

export default function LicenseeContactsCard() {
  const [data, setData] = useState<IDashboardContacts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardContacts()
      .then((res) => setData(res.data as IDashboardContacts))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>
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
