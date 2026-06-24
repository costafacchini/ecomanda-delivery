import { render, screen, fireEvent } from '@testing-library/react'
import RoomItem from './RoomItem'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))
import type { IRoom } from '../../../types'

function makeRoom(overrides: Partial<IRoom> = {}): IRoom {
  return {
    _id: 'room-1',
    id: 'room-1',
    contact: { _id: 'c1', name: 'João Silva', number: '5511999990001' },
    status: 'open',
    closed: false,
    unreadCount: 0,
    lastMessage: null,
    ...overrides,
  }
}

describe('<RoomItem>', () => {
  it('renders contact name and number', () => {
    render(<RoomItem room={makeRoom()} isSelected={false} onClick={vi.fn()} />)

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('5511999990001')).toBeInTheDocument()
  })

  it('renders last message preview when present', () => {
    const room = makeRoom({ lastMessage: { text: 'Olá, tudo bem?', kind: 'text' } })
    render(<RoomItem room={room} isSelected={false} onClick={vi.fn()} />)

    expect(screen.getByText('Olá, tudo bem?')).toBeInTheDocument()
  })

  it('renders unread badge when unreadCount > 0 and no badge when 0', () => {
    const { rerender } = render(<RoomItem room={makeRoom({ unreadCount: 3 })} isSelected={false} onClick={vi.fn()} />)

    expect(screen.getByText('3')).toBeInTheDocument()

    rerender(<RoomItem room={makeRoom({ unreadCount: 0 })} isSelected={false} onClick={vi.fn()} />)

    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<RoomItem room={makeRoom()} isSelected={false} onClick={handleClick} />)

    fireEvent.click(screen.getByText('João Silva'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
