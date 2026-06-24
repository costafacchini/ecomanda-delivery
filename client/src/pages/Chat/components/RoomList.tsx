import type { IRoom } from '../../../types'
import RoomItem from './RoomItem'
import styles from '../styles.module.scss'
import { useTranslation } from 'react-i18next'

interface RoomListProps {
  rooms: IRoom[]
  selectedRoomId: string | undefined
  onSelect: (room: IRoom) => void
  onNewConversation: () => void
}

export default function RoomList({ rooms, selectedRoomId, onSelect, onNewConversation }: RoomListProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>{t('chat.conversationsTitle')}</span>
        <button
          type='button'
          className={styles.newConvoBtn}
          onClick={onNewConversation}
          aria-label={t('chat.newConversationAriaLabel')}
          title={t('chat.newConversationAriaLabel')}
        >
          <i className='bi bi-plus' aria-hidden='true' />
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className={styles.sidebarEmpty} role='status'>
          <i className='bi bi-chat-dots' aria-hidden='true' />
          <p>{t('chat.noConversations')}</p>
        </div>
      ) : (
        <ul className={styles.roomList} role='list' aria-label={t('chat.conversationsTitle')}>
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
