import React from 'react'
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
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className='fw-bold'>Conversas</span>
        <button
          type='button'
          className='btn btn-sm btn-outline-success'
          onClick={onNewConversation}
          aria-label='Nova conversa'
        >
          +
        </button>
      </div>
      {rooms.length === 0 ? (
        <div className='p-3 text-muted'>Nenhuma conversa.</div>
      ) : (
        <ul className='list-group list-group-flush'>
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
    </div>
  )
}
