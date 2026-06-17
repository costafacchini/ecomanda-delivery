import { useState, useEffect } from 'react'
import { useApp } from '../../contexts/App'
import { getRooms, getRoomMessages, sendRoomMessage } from '../../services/rooms'
import type { IRoom } from '../../types'
import type { IMessage } from '../../types'
import styles from './styles.module.scss'
import RoomList from './components/RoomList'
import ConversationPanel from './components/ConversationPanel'
import NewConversationModal from './components/NewConversationModal'
import { useChatSocket } from '../../hooks/useChatSocket'

export default function ChatPage() {
  const { currentUser, activeLicensee } = useApp()
  const effectiveLicenseeId = activeLicensee?.id ??
    (typeof currentUser?.licensee === 'object' ? (currentUser.licensee as { id?: string })?.id : undefined)

  const [rooms, setRooms] = useState<IRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [showNewConvo, setShowNewConvo] = useState(false)

  useEffect(() => {
    if (!effectiveLicenseeId) return
    getRooms({ licensee: effectiveLicenseeId }).then(res => setRooms(res.data.rooms)).catch(console.error)
  }, [effectiveLicenseeId])

  function loadMessages(roomId: string) {
    getRoomMessages(roomId).then(res => setMessages(res.data.messages)).catch(console.error)
  }

  function handleRoomSelect(room: IRoom) {
    setSelectedRoom({ ...room, unreadCount: 0 })
    setRooms(prev => prev.map(r => r._id === room._id ? { ...r, unreadCount: 0 } : r))
    loadMessages(room._id)
  }

  async function handleSend(text: string) {
    if (!selectedRoom) return
    await sendRoomMessage(selectedRoom._id, text)
    loadMessages(selectedRoom._id)
  }

  useChatSocket(effectiveLicenseeId, ({ roomId }) => {
    if (selectedRoom && selectedRoom._id === roomId) {
      loadMessages(selectedRoom._id)
    } else {
      setRooms(prev =>
        prev.map(r => r._id === roomId ? { ...r, unreadCount: (r.unreadCount ?? 0) + 1 } : r)
      )
    }
  })

  function handleRoomCreated(room: IRoom) {
    setRooms(prev => [room, ...prev.filter(r => r._id !== room._id)])
    handleRoomSelect(room)
    setShowNewConvo(false)
  }

  return (
    <div className={styles.chatLayout}>
      <RoomList
        rooms={rooms}
        selectedRoomId={selectedRoom?._id}
        onSelect={handleRoomSelect}
        onNewConversation={() => setShowNewConvo(true)}
      />
      <ConversationPanel room={selectedRoom} messages={messages} onSend={handleSend} />
      <NewConversationModal
        show={showNewConvo}
        onClose={() => setShowNewConvo(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  )
}
