import { render, screen, fireEvent } from '@testing-library/react'
import RoomList from './RoomList'
import type { IRoom } from '../../../types'

function makeRoom(id: string, name: string): IRoom {
  return {
    _id: id,
    id,
    contact: { _id: `c-${id}`, name, number: '5511999990001' },
    status: 'open',
    closed: false,
    unreadCount: 0,
    lastMessage: null,
  }
}

const rooms = [makeRoom('r1', 'Alice'), makeRoom('r2', 'Bob')]

describe('<RoomList>', () => {
  it('renders all room items', () => {
    render(<RoomList rooms={rooms} selectedRoomId={undefined} onSelect={vi.fn()} onNewConversation={vi.fn()} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows "Nenhuma conversa." when rooms is empty', () => {
    render(<RoomList rooms={[]} selectedRoomId={undefined} onSelect={vi.fn()} onNewConversation={vi.fn()} />)

    expect(screen.getByText('Nenhuma conversa.')).toBeInTheDocument()
  })

  it('"+" button calls onNewConversation', () => {
    const handleNewConversation = vi.fn()
    render(<RoomList rooms={rooms} selectedRoomId={undefined} onSelect={vi.fn()} onNewConversation={handleNewConversation} />)

    fireEvent.click(screen.getByRole('button', { name: /nova conversa/i }))

    expect(handleNewConversation).toHaveBeenCalledTimes(1)
  })

  it('passes isSelected=true to the correct room item', () => {
    render(<RoomList rooms={rooms} selectedRoomId='r1' onSelect={vi.fn()} onNewConversation={vi.fn()} />)

    const alice = screen.getByText('Alice').closest('li')
    const bob = screen.getByText('Bob').closest('li')

    expect(alice).toHaveClass('active')
    expect(bob).not.toHaveClass('active')
  })
})
