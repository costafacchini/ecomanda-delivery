import { render, screen, fireEvent } from '@testing-library/react'
import ConversationPanel from './ConversationPanel'
import type { IRoom } from '../../../types'
import type { IMessage } from '../../../types'

const room: IRoom = {
  _id: 'room-1',
  id: 'room-1',
  contact: { _id: 'c1', name: 'Maria Souza', number: '5511999990002' },
  status: 'open',
  closed: false,
}

const messages: IMessage[] = [
  {
    id: 'msg-1',
    kind: 'text',
    destination: 'to-chat',
    text: 'Olá!',
    url: '',
    fileName: '',
    latitude: 0,
    longitude: 0,
    sended: true,
    error: null,
    cart: null,
    createdAt: '2026-06-17T10:00:00.000Z',
    contact: null,
    trigger: null,
    sector: null,
  },
  {
    id: 'msg-2',
    kind: 'text',
    destination: 'to-chat',
    text: 'Tudo bem?',
    url: '',
    fileName: '',
    latitude: 0,
    longitude: 0,
    sended: false,
    error: null,
    cart: null,
    createdAt: '2026-06-17T10:01:00.000Z',
    contact: null,
    trigger: null,
    sector: null,
  },
]

describe('<ConversationPanel>', () => {
  it('shows "Selecione uma conversa." when room is null', () => {
    render(<ConversationPanel room={null} messages={[]} onSend={vi.fn()} />)

    expect(screen.getByText('Selecione uma conversa.')).toBeInTheDocument()
  })

  it('renders contact name when room is provided', () => {
    render(<ConversationPanel room={room} messages={[]} onSend={vi.fn()} />)

    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
  })

  it('messages are present in the DOM', () => {
    render(<ConversationPanel room={room} messages={messages} onSend={vi.fn()} />)

    expect(screen.getByText('Olá!')).toBeInTheDocument()
    expect(screen.getByText('Tudo bem?')).toBeInTheDocument()
  })

  it('delegates send to onSend callback', () => {
    const handleSend = vi.fn()
    render(<ConversationPanel room={room} messages={[]} onSend={handleSend} />)

    fireEvent.change(screen.getByPlaceholderText(/digite uma mensagem/i), { target: { value: 'Nova mensagem' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(handleSend).toHaveBeenCalledWith('Nova mensagem')
  })
})
