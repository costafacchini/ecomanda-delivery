import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            setError(t('dashboard.openRooms.loadError'))
            return
          }
          const { rooms: newRooms = [], hasMore: more = false } = (res.data as IDashboardOpenRoomsResponse) || {}
          setRooms((prev) => (reset ? newRooms : [...prev, ...newRooms]))
          hasMoreRef.current = more
          setHasMore(more)
          pageRef.current = pageNum + 1
        })
        .catch(() => setError(t('dashboard.openRooms.loadError')))
        .finally(() => {
          setLoading(false)
          isFetchingRef.current = false
        })
    },
    [licensee, t],
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
    if (!window.confirm(t('dashboard.openRooms.confirmClose'))) return
    closeDashboardRoom(roomId)
      .then(() => setRooms((prev) => prev.filter((r) => r._id !== roomId)))
      .catch(() => setError(t('dashboard.openRooms.closeError')))
  }

  return (
    <div className="card">
      <div className="card-header">{t('dashboard.openRooms.cardTitle')}</div>
      <div ref={containerRef} className="card-body pb-0" style={{ maxHeight: 480, overflowY: 'auto' }}>
        {error && <p className="text-danger p-3 mb-0">{error}</p>}
        {rooms.length === 0 && !loading && !error && (
          <p className="text-muted p-3 mb-0">{t('dashboard.openRooms.noRooms')}</p>
        )}
        {rooms.length > 0 && (
          <table className="table table-sm mb-0">
            <thead className="sticky-top bg-white">
              <tr>
                <th>{t('dashboard.openRooms.colContact')}</th>
                <th>{t('dashboard.openRooms.colNumber')}</th>
                <th>{t('dashboard.openRooms.colOpened')}</th>
                <th>{t('dashboard.openRooms.colLastMessage')}</th>
                <th>{t('dashboard.openRooms.colMessage')}</th>
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
                      aria-label={t('dashboard.openRooms.closeRoomAriaLabel', { name: room.contact?.name || room.contact?.number || 'contato' })}
                      onClick={() => handleClose(room._id)}
                    >
                      {t('dashboard.openRooms.closeButton')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={sentinelRef} className="py-2 text-center text-muted small">
          {loading && (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              {t('common.loading')}
            </>
          )}
          {!loading && !hasMore && rooms.length > 0 && t('dashboard.endOfList')}
        </div>
      </div>
    </div>
  )
}
