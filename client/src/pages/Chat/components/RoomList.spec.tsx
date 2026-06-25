import { render, screen, fireEvent } from '@testing-library/react'
import RoomList from './RoomList'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))
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

    expect(screen.getByText('chat.noConversations')).toBeInTheDocument()
  })

  it('"+" button calls onNewConversation', () => {
    const handleNewConversation = vi.fn()
    render(<RoomList rooms={rooms} selectedRoomId={undefined} onSelect={vi.fn()} onNewConversation={handleNewConversation} />)

    fireEvent.click(screen.getByRole('button', { name: 'chat.newConversationAriaLabel' }))

    expect(handleNewConversation).toHaveBeenCalledTimes(1)
  })

  it('passes isSelected=true to the correct room item', () => {
    render(<RoomList rooms={rooms} selectedRoomId='r1' onSelect={vi.fn()} onNewConversation={vi.fn()} />)

    const aliceBtn = screen.getByText('Alice').closest('li')?.querySelector('button')
    const bobBtn = screen.getByText('Bob').closest('li')?.querySelector('button')

    expect(aliceBtn).toHaveAttribute('aria-current', 'true')
    expect(bobBtn).not.toHaveAttribute('aria-current')
  })
})
