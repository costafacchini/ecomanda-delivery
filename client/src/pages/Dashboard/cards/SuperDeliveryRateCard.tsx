import { useState, useEffect } from 'react'
import { getDashboardDeliveryRate } from '../../../services/dashboard'
import FailedMessagesModal from './FailedMessagesModal'

export default function SuperDeliveryRateCard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getDashboardDeliveryRate()
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  function handleResendSuccess() {
    setData((prev: any) => ({
      ...prev,
      failed_today: Math.max(0, (prev.failed_today || 0) - 1),
    }))
  }

  if (loading) return <div className="card"><div className="card-body">Carregando...</div></div>
  if (error) return <div className="card"><div className="card-body text-danger">{error}</div></div>

  return (
    <>
      <div className="card">
        <div className="card-header">Taxa de Entrega</div>
        <div className="card-body">
          <div className="d-flex gap-4">
            <div>
              <div className="fs-4 fw-bold text-success">{data.sent_today}</div>
              <div className="text-muted small">Enviadas ({data.sent_pct}%)</div>
            </div>
            <div>
              <div
                className="fs-4 fw-bold text-danger"
                role="button"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setModalOpen(true)}
              >
                {data.failed_today}
              </div>
              <div className="text-muted small">Falhas ({data.failed_pct}%)</div>
            </div>
          </div>
        </div>
      </div>

      <FailedMessagesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onResendSuccess={handleResendSuccess}
      />
    </>
  )
}
