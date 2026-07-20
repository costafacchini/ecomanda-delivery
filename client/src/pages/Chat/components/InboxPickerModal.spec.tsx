import { render, screen, fireEvent } from '@testing-library/react'
import InboxPickerModal from './InboxPickerModal'
import type { IInbox } from '../../../types/inbox'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

const sampleInboxes: IInbox[] = [
  { _id: 'i1', name: 'Inbox Alpha', kind: 'chat', inboxToken: 'tok-1', webhookUrl: null, active: true },
  { _id: 'i2', name: 'Inbox Beta', kind: 'chat', inboxToken: 'tok-2', webhookUrl: null, active: true },
]

function mount(overrides: Partial<React.ComponentProps<typeof InboxPickerModal>> = {}) {
  const onSelect = vi.fn()
  const onDismiss = vi.fn()
  render(
    <InboxPickerModal
      inboxes={sampleInboxes}
      onSelect={onSelect}
      onDismiss={onDismiss}
      {...overrides}
    />
  )
  return { onSelect, onDismiss }
}

describe('<InboxPickerModal />', () => {
  it('renders a list of inbox names', () => {
    mount()

    expect(screen.getByText('Inbox Alpha')).toBeInTheDocument()
    expect(screen.getByText('Inbox Beta')).toBeInTheDocument()
  })

  it('calls onSelect with the chosen inbox when confirmed', () => {
    const { onSelect } = mount()

    fireEvent.click(screen.getByText('Inbox Alpha'))
    fireEvent.click(screen.getByRole('button', { name: 'common.confirm' }))

    expect(onSelect).toHaveBeenCalledWith(sampleInboxes[0])
  })

  it('confirm button is disabled until an inbox is selected', () => {
    mount()

    expect(screen.getByRole('button', { name: 'common.confirm' })).toBeDisabled()

    fireEvent.click(screen.getByText('Inbox Beta'))

    expect(screen.getByRole('button', { name: 'common.confirm' })).not.toBeDisabled()
  })

  it('calls onDismiss when the cancel button is clicked', () => {
    const { onDismiss } = mount()

    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }))

    expect(onDismiss).toHaveBeenCalled()
  })

  it('calls onDismiss when the close button is clicked', () => {
    const { onDismiss } = mount()

    fireEvent.click(screen.getByRole('button', { name: 'chat.closeModalAriaLabel' }))

    expect(onDismiss).toHaveBeenCalled()
  })
})
