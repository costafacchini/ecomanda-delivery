import { useState, useEffect } from 'react'
import { getDashboardDeliveryRate } from '../../../services/dashboard'
import FailedMessagesModal from './FailedMessagesModal'

const today = () => new Date().toISOString().split('T')[0]
const firstDayOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

export default function SuperDeliveryRateCard({ licensee }: { licensee?: string }) {
  const [startDate, setStartDate] = useState(firstDayOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardDeliveryRate({ ...(licensee ? { licensee } : {}), startDate, endDate })
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [licensee, startDate, endDate])

  function handleResendSuccess() {
    setData((prev: any) => ({
      ...prev,
      failed_today: Math.max(0, (prev.failed_today || 0) - 1),
    }))
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span>Taxa de Entrega</span>
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
            <div className="d-flex gap-4 align-items-end">
              <div>
                <div className="fs-4 fw-bold text-success">{data.sent_today}</div>
                <div className="text-muted small">Enviadas ({data.sent_pct}%)</div>
              </div>
              <div>
                <div className="fs-4 fw-bold text-danger">{data.failed_today}</div>
                <div className="text-muted small">Falhas no período ({data.failed_pct}%)</div>
              </div>
              {data.failed_today > 0 && (
                <div className="ms-auto">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setModalOpen(true)}
                  >
                    Mensagens Falhas ({data.failed_today})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FailedMessagesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onResendSuccess={handleResendSuccess}
        startDate={startDate}
        endDate={endDate}
      />
    </>
  )
}
