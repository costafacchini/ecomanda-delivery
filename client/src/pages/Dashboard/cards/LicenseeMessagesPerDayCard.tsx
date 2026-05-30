import { useState, useEffect } from 'react'
import { getDashboardMessagesPerDay } from '../../../services/dashboard'

export default function LicenseeMessagesPerDayCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardMessagesPerDay()
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

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
            {(data.per_day || []).map((row: any) => (
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
