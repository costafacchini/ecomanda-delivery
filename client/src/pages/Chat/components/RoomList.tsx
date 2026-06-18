import type { IRoom } from '../../../types'
import RoomItem from './RoomItem'
import styles from '../styles.module.scss'

interface RoomListProps {
  rooms: IRoom[]
  selectedRoomId: string | undefined
  onSelect: (room: IRoom) => void
  onNewConversation: () => void
}

export default function RoomList({ rooms, selectedRoomId, onSelect, onNewConversation }: RoomListProps) {
  return (
    <>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Conversas</span>
        <button
          type='button'
          className={styles.newConvoBtn}
          onClick={onNewConversation}
          aria-label='Nova conversa'
          title='Nova conversa'
        >
          <i className='bi bi-plus' aria-hidden='true' />
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className={styles.sidebarEmpty} role='status'>
          <i className='bi bi-chat-dots' aria-hidden='true' />
          <p>Nenhuma conversa ainda. Crie uma nova conversa para começar.</p>
        </div>
      ) : (
        <ul className={styles.roomList} role='list' aria-label='Lista de conversas'>
          {rooms.map((room) => (
            <RoomItem
              key={room._id}
              room={room}
              isSelected={room._id === selectedRoomId}
              onClick={() => onSelect(room)}
            />
          ))}
        </ul>
      )}
    </>
  )
}
