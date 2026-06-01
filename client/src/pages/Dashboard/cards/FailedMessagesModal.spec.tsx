import { render, screen, fireEvent } from '@testing-library/react'
import FailedMessagesModal from './FailedMessagesModal'
import { getMessages, resendMessage } from '../../../services/message'

vi.mock('../../../services/message')

const noop = () => {}

describe('<FailedMessagesModal />', () => {
  it('does not render anything when isOpen is false', () => {
    render(<FailedMessagesModal isOpen={false} onClose={noop} onResendSuccess={noop} />)

    expect(screen.queryByText('Mensagens com Falha')).not.toBeInTheDocument()
  })

  it('fetches failed messages on open and renders them in the table', async () => {
    getMessages.mockResolvedValue({
      data: [
        { _id: 'msg1', contact: { number: '5511999990001' }, text: 'Hello world', error: 'timeout' },
        { _id: 'msg2', contact: { number: '5511999990002' }, text: null, error: null },
      ],
    })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    expect(await screen.findByText('5511999990001')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('timeout')).toBeInTheDocument()
    expect(screen.getByText('5511999990002')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Reenviar' })).toHaveLength(2)

    expect(getMessages).toHaveBeenCalledWith({ sended: false, limit: 50 })
  })

  it('shows empty state when no failed messages are returned', async () => {
    getMessages.mockResolvedValue({ data: [] })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    expect(await screen.findByText('Nenhuma mensagem com falha.')).toBeInTheDocument()
  })

  it('shows a fetch error when getMessages rejects', async () => {
    getMessages.mockRejectedValue(new Error('network error'))

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    expect(await screen.findByText('Erro ao carregar mensagens falhas.')).toBeInTheDocument()
  })

  it('removes the row and calls onResendSuccess when resend succeeds', async () => {
    getMessages.mockResolvedValue({
      data: [
        { _id: 'msg1', contact: { number: '5511111111111' }, text: 'Test', error: 'err' },
      ],
    })
    resendMessage.mockResolvedValue({})
    const onResendSuccess = vi.fn()

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={onResendSuccess} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Reenviar' }))

    await screen.findByText('Nenhuma mensagem com falha.')

    expect(resendMessage).toHaveBeenCalledWith('msg1')
    expect(onResendSuccess).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('5511111111111')).not.toBeInTheDocument()
  })

  it('shows an inline row error when resend fails', async () => {
    getMessages.mockResolvedValue({
      data: [
        { _id: 'msg1', contact: { number: '5511111111111' }, text: 'Test', error: 'err' },
      ],
    })
    resendMessage.mockRejectedValue(new Error('resend failed'))

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Reenviar' }))

    expect(await screen.findByText('Erro ao reenviar.')).toBeInTheDocument()
    expect(screen.getByText('5511111111111')).toBeInTheDocument()
  })

  it('falls back to em-dash for missing contact number and text', async () => {
    getMessages.mockResolvedValue({
      data: [{ _id: 'msg1', contact: null, text: null, error: null }],
    })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    await screen.findByRole('button', { name: 'Reenviar' })

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
  })
})
