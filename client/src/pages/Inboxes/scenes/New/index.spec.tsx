import InboxNew from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createInbox } from '../../../../services/inbox'
import { createRoutesStub } from 'react-router'

vi.mock('../../../../services/inbox')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<InboxNew />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1' },
  }

  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/inboxes/new',
        Component: () => <InboxNew currentUser={currentUser} />,
      },
      {
        path: '/inboxes',
        Component: () => <div>Inboxes Index</div>,
      },
    ])
    render(<Stub initialEntries={['/inboxes/new']} />)
  }

  it('renders the new inbox form', () => {
    mount()

    expect(screen.getByLabelText('common.name')).toBeInTheDocument()
    expect(screen.getByLabelText('inboxes.active')).toBeInTheDocument()
  })

  it('creates an inbox and redirects on success', async () => {
    ;(createInbox as any).mockResolvedValue({ status: 201, data: {} })

    mount()

    fireEvent.change(screen.getByLabelText('common.name'), { target: { value: 'WhatsApp Principal' } })
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() =>
      expect(createInbox).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'WhatsApp Principal', licensee: 'lic-1' })
      )
    )

    expect(await screen.findByText('Inboxes Index')).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    mount()

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() =>
      expect(screen.getByText('inboxes.validation.nameRequired')).toBeInTheDocument()
    )
    expect(createInbox).not.toHaveBeenCalled()
  })
})
