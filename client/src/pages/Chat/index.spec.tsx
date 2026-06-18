import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatPage from './index'
import { getRooms, getRoomMessages, sendRoomMessage } from '../../services/rooms'
import { AppContext } from '../../contexts/App'

vi.mock('../../services/rooms')
vi.mock('./components/NewConversationModal', () => ({
  default: () => null,
}))

const appContextValue = {
  currentUser: { role: 'agent', licensee: { id: 'lic-1' } },
  activeLicensee: { id: 'lic-1', name: 'Licensee' },
  updateActiveLicensee: vi.fn(),
  resetLicenseeModal: vi.fn(),
  setCurrentUser: vi.fn(),
  markLicenseeModalSeen: vi.fn(),
  licenseeModalSeen: false,
}

function mount() {
  return render(
    <AppContext.Provider value={appContextValue}>
      <ChatPage />
    </AppContext.Provider>
  )
}

const sampleRooms = [
  { _id: 'r1', id: 'r1', contact: { _id: 'c1', name: 'Alice', number: '5511999990001' }, status: 'open', closed: false, unreadCount: 0 },
  { _id: 'r2', id: 'r2', contact: { _id: 'c2', name: 'Bob', number: '5511999990002' }, status: 'pending', closed: false, unreadCount: 2 },
]

const sampleMessages = [
  { id: 'm1', kind: 'text', destination: 'to-chat', text: 'Hello', url: '', fileName: '', latitude: 0, longitude: 0, sended: true, error: null, cart: null, createdAt: '2026-06-17T10:00:00.000Z', contact: null, trigger: null, sector: null },
]

describe('<ChatPage>', () => {
  it('calls getRooms on mount', async () => {
    (getRooms as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { rooms: [], hasMore: false } })

    mount()

    await waitFor(() => {
      expect(getRooms).toHaveBeenCalled()
    })
  })

  it('renders rooms from getRooms', async () => {
    (getRooms as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { rooms: sampleRooms, hasMore: false } })

    mount()

    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('clicking a room calls getRoomMessages', async () => {
    (getRooms as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { rooms: sampleRooms, hasMore: false } })
    ;(getRoomMessages as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { messages: [], total: 0, page: 1, hasMore: false } })

    mount()

    fireEvent.click(await screen.findByText('Alice'))

    await waitFor(() => {
      expect(getRoomMessages).toHaveBeenCalledWith('r1')
    })
  })

  it('submitting the input calls sendRoomMessage', async () => {
    (getRooms as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { rooms: sampleRooms, hasMore: false } })
    ;(getRoomMessages as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { messages: sampleMessages, total: 1, page: 1, hasMore: false } })
    ;(sendRoomMessage as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} })

    mount()

    fireEvent.click(await screen.findByText('Alice'))

    await waitFor(() => expect(getRoomMessages).toHaveBeenCalled())

    fireEvent.change(screen.getByPlaceholderText(/digite uma mensagem/i), { target: { value: 'Oi!' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(sendRoomMessage).toHaveBeenCalledWith('r1', 'Oi!')
    })
  })
})
