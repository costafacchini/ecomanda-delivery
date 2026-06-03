import { useState, useEffect } from 'react'
import { getDashboardMessageVolume } from '../../../services/dashboard'

export default function SuperMessageVolumeCard({ licensee }: { licensee?: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    getDashboardMessageVolume(licensee ? { licensee } : {})
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [licensee])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

  return (
    <div className="card">
      <div className="card-header">Volume de Mensagens</div>
      <div className="card-body">
        <div className="d-flex gap-4 mb-3">
          <div>
            <div className="fs-4 fw-bold">{data.peak_throughput}</div>
            <div className="text-muted small">Pico (msg/s)</div>
          </div>
          <div>
            <div className="fs-4 fw-bold">{data.avg_transfer_rate}</div>
            <div className="text-muted small">Média (msg/s)</div>
          </div>
        </div>

        <div className="row">
          <div className="col-6">
            <div className="fw-semibold mb-1 small">Por Dia</div>
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data.per_day || []).map((row: any) => (
                  <tr key={row._id}>
                    <td>{row._id}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-6">
            <div className="fw-semibold mb-1 small">Por Hora</div>
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data.per_hour || []).map((row: any) => (
                  <tr key={row._id}>
                    <td>{row._id?.split('T')[1]}h</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
