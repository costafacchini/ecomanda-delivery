import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { getToken } from '../services/auth'

type NewRoomMessageData = {
  roomId: string
  messageId: string
  licenseeId: string
}

export function useChatSocket(
  licenseeId: string | undefined,
  onNewRoomMessage: (data: NewRoomMessageData) => void,
) {
  useEffect(() => {
    if (!licenseeId) return

    const socket = io({ auth: { token: getToken() } })
    socket.emit('join-licensee', licenseeId)
    socket.on('new-room-message', onNewRoomMessage)

    return () => {
      socket.disconnect()
    }
  }, [licenseeId]) // eslint-disable-line react-hooks/exhaustive-deps
}
