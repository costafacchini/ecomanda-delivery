import { useState, useEffect } from 'react'
import { getDashboardLicensees } from '../../../services/dashboard'
import type { IDashboardLicensees } from '../../../types'

export default function SuperLicenseesCard() {
  const [data, setData] = useState<IDashboardLicensees | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardLicensees()
      .then((res) => setData(res.data as IDashboardLicensees))
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
      <div className="card-header">Licenciados</div>
      <div className="card-body">
        <div className="d-flex gap-4 mb-3">
          <div>
            <div className="fs-4 fw-bold">{data.total}</div>
            <div className="text-muted small">Total</div>
          </div>
          <div>
            <div className="fs-4 fw-bold text-success">{data.active}</div>
            <div className="text-muted small">Ativos</div>
          </div>
        </div>
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Demo</td>
              <td>{data.by_kind?.demo ?? 0}</td>
            </tr>
            <tr>
              <td>Grátis</td>
              <td>{data.by_kind?.free ?? 0}</td>
            </tr>
            <tr>
              <td>Pago</td>
              <td>{data.by_kind?.paid ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
