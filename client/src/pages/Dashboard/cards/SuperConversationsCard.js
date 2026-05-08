import { useState, useEffect } from 'react'
import { getDashboardConversations } from '../../../services/dashboard'

export default function SuperConversationsCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardConversations()
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

  return (
    <div className="card">
      <div className="card-header">Conversas</div>
      <div className="card-body">
        <div className="d-flex gap-4">
          <div>
            <div className="fs-4 fw-bold text-success">{data.started_today}</div>
            <div className="text-muted small">Iniciadas hoje</div>
          </div>
          <div>
            <div className="fs-4 fw-bold">{data.ended_today}</div>
            <div className="text-muted small">Encerradas hoje</div>
          </div>
          <div>
            <div className="fs-4 fw-bold">{data.avg_messages_per_conversation}</div>
            <div className="text-muted small">Média msg/conversa</div>
          </div>
          <div>
            <div className="fs-4 fw-bold">{data.avg_duration_seconds}s</div>
            <div className="text-muted small">Duração média</div>
          </div>
        </div>
      </div>
    </div>
  )
}
