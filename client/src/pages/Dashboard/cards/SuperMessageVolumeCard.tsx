import { useState, useEffect, useMemo } from 'react'
import { getDashboardMessageVolume } from '../../../services/dashboard'

const today = () => new Date().toISOString().split('T')[0]
const firstDayOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

function buildHourAverages(perHour: any[]) {
  const hourMap: Record<string, number[]> = {}
  for (const row of perHour) {
    const hour = row._id?.split('T')[1]
    if (!hour) continue
    if (!hourMap[hour]) hourMap[hour] = []
    hourMap[hour].push(row.count)
  }
  return Object.entries(hourMap)
    .map(([hour, counts]) => ({ hour, avg: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)
    .sort((a, b) => a.hour.localeCompare(b.hour))
}

export default function SuperMessageVolumeCard({ licensee }: { licensee?: string }) {
  const [startDate, setStartDate] = useState(firstDayOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardMessageVolume({ ...(licensee ? { licensee } : {}), startDate, endDate })
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [licensee, startDate, endDate])

  const hourAverages = useMemo(() => buildHourAverages(data?.per_hour || []), [data])

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Volume de Mensagens</span>
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
          <>
            <div className="d-flex gap-4 mb-3">
              <div>
                <div className="fs-4 fw-bold">{data.peak_throughput}</div>
                <div className="text-muted small">Pico (msg/hora)</div>
              </div>
              <div>
                <div className="fs-4 fw-bold">{data.avg_transfer_rate}</div>
                <div className="text-muted small">Média (msg/hora)</div>
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
                      <th>Média</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hourAverages.map(({ hour, avg }) => (
                      <tr key={hour}>
                        <td>{hour}h</td>
                        <td>{avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
