import { useState, useEffect } from 'react'
import { getDashboardMessagesPerDay } from '../../../services/dashboard'
import type { IDashboardMessagesPerDay } from '../../../types'

export default function LicenseeMessagesPerDayCard() {
  const [data, setData] = useState<IDashboardMessagesPerDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardMessagesPerDay()
      .then((res) => setData(res.data as IDashboardMessagesPerDay))
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
      <div className="card-header">Mensagens por Dia</div>
      <div className="card-body">
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th>Data</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.per_day || []).length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center text-muted">Nenhum dado para o período.</td>
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
