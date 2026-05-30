import { useState, useEffect } from 'react'
import { getDashboardQueue } from '../../../services/dashboard'

export default function SuperQueueCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardQueue()
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

  return (
    <div className="card">
      <div className="card-header">Fila de Mensagens</div>
      <div className="card-body">
        <div className="d-flex gap-4">
          <div>
            <div className="fs-4 fw-bold">{data.pending_messages}</div>
            <div className="text-muted small">Pendentes</div>
          </div>
          <div>
            <div className="fs-4 fw-bold">{data.avg_time_in_queue_seconds}s</div>
            <div className="text-muted small">Tempo médio na fila</div>
          </div>
        </div>
      </div>
    </div>
  )
}
