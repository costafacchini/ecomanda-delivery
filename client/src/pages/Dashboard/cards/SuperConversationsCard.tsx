import { useState, useEffect } from 'react'
import { getDashboardConversations } from '../../../services/dashboard'

const today = () => new Date().toISOString().split('T')[0]

export default function SuperConversationsCard({ licensee }: { licensee?: string }) {
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardConversations({ ...(licensee ? { licensee } : {}), startDate, endDate })
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [licensee, startDate, endDate])

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Conversas</span>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-muted small">até</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading && <p>Carregando...</p>}
        {error && <p className="text-danger">{error}</p>}
        {data && (
          <div className="d-flex gap-4">
            <div>
              <div className="fs-4 fw-bold text-success">{data.started_today}</div>
              <div className="text-muted small">Iniciadas</div>
            </div>
            <div>
              <div className="fs-4 fw-bold">{data.ended_today}</div>
              <div className="text-muted small">Encerradas</div>
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
        )}
      </div>
    </div>
  )
}
