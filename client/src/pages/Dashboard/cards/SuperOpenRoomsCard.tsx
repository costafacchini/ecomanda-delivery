import { useState, useEffect, useCallback, useRef } from 'react'
import moment from 'moment-timezone'
import { getDashboardOpenRooms, closeDashboardRoom } from '../../../services/dashboard'
import type { IDashboardOpenRoom, IDashboardOpenRoomsResponse } from '../../../types'

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

function formatDate(value: string | undefined): string {
  if (!value) return '—'
  return moment(value).tz(tz).format('DD/MM/YYYY HH:mm')
}

const LIMIT = 10

export default function SuperOpenRoomsCard({ licensee }: { licensee?: string }) {
  const [rooms, setRooms] = useState<IDashboardOpenRoom[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(false)

  const fetchRooms = useCallback(
    (pageNum: number, reset: boolean) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setLoading(true)
      getDashboardOpenRooms({ ...(licensee ? { licensee } : {}), page: pageNum, limit: LIMIT })
        .then((res) => {
          if (res.status !== 200) {
            setError('Erro ao carregar conversas.')
            return
          }
          const { rooms: newRooms = [], hasMore: more = false } = (res.data as IDashboardOpenRoomsResponse) || {}
          setRooms((prev) => (reset ? newRooms : [...prev, ...newRooms]))
          hasMoreRef.current = more
          setHasMore(more)
          pageRef.current = pageNum + 1
        })
        .catch(() => setError('Erro ao carregar conversas.'))
        .finally(() => {
          setLoading(false)
          isFetchingRef.current = false
        })
    },
    [licensee],
  )

  // Reset and initial load when licensee changes
  useEffect(() => {
    pageRef.current = 1
    hasMoreRef.current = false
    setRooms([])
    setHasMore(false)
    setError(null)
    fetchRooms(1, true)
  }, [licensee]) // eslint-disable-line react-hooks/exhaustive-deps

  // Set up IntersectionObserver once per licensee change, scoped to the scrollable container
  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          fetchRooms(pageRef.current, false)
        }
      },
      { root: container, threshold: 0.1 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchRooms])

  function handleClose(roomId: string) {
    closeDashboardRoom(roomId)
      .then(() => setRooms((prev) => prev.filter((r) => r._id !== roomId)))
      .catch(() => setError('Erro ao fechar conversa.'))
  }

  return (
    <div className="card">
      <div className="card-header">Conversas Abertas</div>
      <div ref={containerRef} className="card-body p-0" style={{ maxHeight: 480, overflowY: 'auto' }}>
        {error && <p className="text-danger p-3 mb-0">{error}</p>}
        {rooms.length === 0 && !loading && !error && (
          <p className="text-muted p-3 mb-0">Nenhuma conversa aberta.</p>
        )}
        {rooms.length > 0 && (
          <table className="table table-sm mb-0">
            <thead className="sticky-top bg-white">
              <tr>
                <th>Contato</th>
                <th>Número</th>
                <th>Abertura</th>
                <th>Última mensagem</th>
                <th>Mensagem</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.contact?.name || '—'}</td>
                  <td className="text-nowrap">{room.contact?.number || '—'}</td>
                  <td className="text-nowrap">{formatDate(room.createdAt)}</td>
                  <td className="text-nowrap">{formatDate(room.lastMessage?.createdAt)}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {room.lastMessage?.text || '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleClose(room._id)}
                    >
                      Fechar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={sentinelRef} className="py-2 text-center text-muted small">
          {loading && 'Carregando...'}
          {!loading && !hasMore && rooms.length > 0 && 'Fim da lista.'}
        </div>
      </div>
    </div>
  )
}
