import { useState, useEffect } from 'react'
import { getDashboardLicensees } from '../../../services/dashboard'

export default function SuperLicenseesCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    getDashboardLicensees()
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

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
