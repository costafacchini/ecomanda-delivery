import type { IRoom } from '../../../types'
import styles from '../styles.module.scss'

interface RoomItemProps {
  room: IRoom
  isSelected: boolean
  onClick: () => void
}

function formatRoomTime(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function RoomItem({ room, isSelected, onClick }: RoomItemProps) {
  const initial = room.contact.name.charAt(0).toUpperCase()
  const time = formatRoomTime(room.lastMessage?.createdAt)
  const unread = room.unreadCount ?? 0

  return (
    <li>
      <button
        type='button'
        className={`${styles.roomItem}${isSelected ? ` ${styles.roomItemSelected}` : ''}`}
        onClick={onClick}
        aria-current={isSelected ? 'true' : undefined}
      >
        <div className={styles.roomAvatar} aria-hidden='true'>{initial}</div>

        <div className={styles.roomContent}>
          <span className={styles.roomName}>{room.contact.name}</span>
          {room.contact.number && (
            <span className={styles.roomSub}>{room.contact.number}</span>
          )}
          {room.lastMessage?.text && (
            <span className={styles.roomPreview}>{room.lastMessage.text}</span>
          )}
        </div>

        <div className={styles.roomMeta} aria-hidden='true'>
          {time && <span className={styles.roomTime}>{time}</span>}
          {unread > 0 && (
            <span className={styles.unreadBadge}>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </button>
    </li>
  )
}
