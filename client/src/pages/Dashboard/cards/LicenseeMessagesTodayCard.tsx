import { useState, useEffect } from 'react'
import { getDashboardMessagesToday } from '../../../services/dashboard'

export default function LicenseeMessagesTodayCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    getDashboardMessagesToday()
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

  return (
    <div className="card">
      <div className="card-header">Mensagens Hoje</div>
      <div className="card-body">
        <div className="d-flex gap-4">
          <div>
            <div className="fs-4 fw-bold text-success">{data.sent_today}</div>
            <div className="text-muted small">Enviadas ({data.sent_pct}%)</div>
          </div>
          <div>
            <div className="fs-4 fw-bold text-danger">{data.failed_today}</div>
            <div className="text-muted small">Falhas ({data.failed_pct}%)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
