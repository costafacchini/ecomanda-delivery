import React from 'react'
import type { IRoom } from '../../../types'

interface RoomItemProps {
  room: IRoom
  isSelected: boolean
  onClick: () => void
}

export default function RoomItem({ room, isSelected, onClick }: RoomItemProps) {
  return (
    <li
      className={`list-group-item list-group-item-action${isSelected ? ' active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-start'>
        <div>
          <div className='fw-semibold'>{room.contact.name}</div>
          {room.contact.number && (
            <div className='text-muted small'>{room.contact.number}</div>
          )}
          {room.lastMessage && (
            <div className='text-muted small text-truncate' style={{ maxWidth: '180px' }}>
              {room.lastMessage.text}
            </div>
          )}
        </div>
        {(room.unreadCount ?? 0) > 0 && (
          <span className='badge bg-success rounded-pill'>{room.unreadCount}</span>
        )}
      </div>
    </li>
  )
}
