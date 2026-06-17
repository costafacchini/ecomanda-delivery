import { useState, useEffect } from 'react'
import { getDashboardQueue } from '../../../services/dashboard'
import type { IDashboardQueue } from '../../../types'

const today = () => new Date().toISOString().split('T')[0]

export default function SuperQueueCard({ licensee }: { licensee?: string }) {
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<IDashboardQueue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardQueue({ ...(licensee ? { licensee } : {}), startDate, endDate })
      .then((res) => setData(res.data as IDashboardQueue))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [licensee, startDate, endDate])

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Fila de Mensagens</span>
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
              <div className="fs-4 fw-bold">{data.pending_messages}</div>
              <div className="text-muted small">Pendentes</div>
            </div>
            <div>
              <div className="fs-4 fw-bold">{data.avg_time_in_queue_seconds}s</div>
              <div className="text-muted small">Tempo médio na fila</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
