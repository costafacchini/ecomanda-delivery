import { render, screen, fireEvent } from '@testing-library/react'
import FailedMessagesModal from './FailedMessagesModal'
import { getMessages, resendMessage } from '../../../services/message'

vi.mock('../../../services/message')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

const noop = () => {}

describe('<FailedMessagesModal />', () => {
  it('does not render anything when isOpen is false', () => {
    render(<FailedMessagesModal isOpen={false} onClose={noop} onResendSuccess={noop} />)

    expect(screen.queryByText('dashboard.failedMessages.modalTitle')).not.toBeInTheDocument()
  })

  it('fetches failed messages on open and renders them in the table', async () => {
    getMessages.mockResolvedValue({
      data: [
        { _id: 'msg1', contact: { number: '5511999990001' }, text: 'Hello world', error: 'timeout', createdAt: '2024-06-03T14:30:00.000Z' },
        { _id: 'msg2', contact: { number: '5511999990002' }, text: null, error: null, createdAt: '2024-06-03T15:00:00.000Z' },
      ],
    })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    expect(await screen.findByText('5511999990001')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('timeout')).toBeInTheDocument()
    expect(screen.getByText('5511999990002')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'dashboard.failedMessages.colDateTime' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'dashboard.failedMessages.resendButton' })).toHaveLength(2)

    expect(getMessages).toHaveBeenCalledWith({ sended: false, limit: 50 })
  })

  it('passes licensee to getMessages when provided', async () => {
    getMessages.mockResolvedValue({ data: [] })

    render(
      <FailedMessagesModal
        isOpen={true}
        onClose={noop}
        onResendSuccess={noop}
        licensee="licensee-abc"
      />
    )

    await screen.findByText('dashboard.failedMessages.noMessages')

    expect(getMessages).toHaveBeenCalledWith(
      expect.objectContaining({ licensee: 'licensee-abc', sended: false })
    )
  })

  it('does not include licensee in params when not provided', async () => {
    getMessages.mockResolvedValue({ data: [] })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    await screen.findByText('dashboard.failedMessages.noMessages')

    const call = (getMessages as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call).not.toHaveProperty('licensee')
  })

  it('shows empty state when no failed messages are returned', async () => {
    getMessages.mockResolvedValue({ data: [] })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    expect(await screen.findByText('dashboard.failedMessages.noMessages')).toBeInTheDocument()
  })

  it('shows a fetch error when getMessages rejects', async () => {
    getMessages.mockRejectedValue(new Error('network error'))

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    expect(await screen.findByText('dashboard.failedMessages.fetchError')).toBeInTheDocument()
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

    fireEvent.click(await screen.findByRole('button', { name: 'dashboard.failedMessages.resendButton' }))

    await screen.findByText('dashboard.failedMessages.noMessages')

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

    fireEvent.click(await screen.findByRole('button', { name: 'dashboard.failedMessages.resendButton' }))

    expect(await screen.findByText('dashboard.failedMessages.resendError')).toBeInTheDocument()
    expect(screen.getByText('5511111111111')).toBeInTheDocument()
  })

  it('falls back to em-dash for missing contact number and text', async () => {
    getMessages.mockResolvedValue({
      data: [{ _id: 'msg1', contact: null, text: null, error: null }],
    })

    render(<FailedMessagesModal isOpen={true} onClose={noop} onResendSuccess={noop} />)

    await screen.findByRole('button', { name: 'dashboard.failedMessages.resendButton' })

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
  })
})
