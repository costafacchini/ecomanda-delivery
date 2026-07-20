import InboxesIndex from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getInboxes, deleteInbox } from '../../../../services/inbox'
import { createRoutesStub } from 'react-router'
import { inboxFactory } from '../../../../factories/inbox'

vi.mock('../../../../services/inbox')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<InboxesIndex />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1', name: 'Acme' },
  }

  function mount(user = currentUser) {
    const Stub = createRoutesStub([
      {
        path: '/inboxes',
        Component: () => <InboxesIndex currentUser={user} />,
      },
    ])
    render(<Stub initialEntries={['/inboxes']} />)
  }

  it('renders inbox list with inbox names', async () => {
    ;(getInboxes as any).mockResolvedValue({
      status: 200,
      data: [
        inboxFactory.build({ id: '1', name: 'WhatsApp Principal', kind: 'messenger', active: true }),
        inboxFactory.build({ id: '2', name: 'Chat Suporte', kind: 'chat', active: false }),
      ],
    })

    mount()

    expect(await screen.findByText('WhatsApp Principal')).toBeInTheDocument()
    expect(await screen.findByText('Chat Suporte')).toBeInTheDocument()
  })

  it('calls getInboxes with the current licensee id', async () => {
    ;(getInboxes as any).mockResolvedValue({ status: 200, data: [] })

    mount()

    await waitFor(() => expect(getInboxes).toHaveBeenCalledWith({ licensee: 'lic-1' }))
  })

  it('deletes an inbox when confirmed', async () => {
    ;(getInboxes as any).mockResolvedValue({
      status: 200,
      data: [inboxFactory.build({ id: '10', name: 'Inbox TI' })],
    })
    ;(deleteInbox as any).mockResolvedValue({ status: 204 })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mount()

    await screen.findByText('Inbox TI')

    fireEvent.click(screen.getByTitle('inboxes.deleteInboxTitle'))

    await waitFor(() => expect(deleteInbox).toHaveBeenCalledWith('10'))
  })

  it('does not delete an inbox when confirm is cancelled', async () => {
    ;(getInboxes as any).mockResolvedValue({
      status: 200,
      data: [inboxFactory.build({ id: '10', name: 'Inbox TI' })],
    })

    vi.spyOn(window, 'confirm').mockReturnValue(false)

    mount()

    await screen.findByText('Inbox TI')

    fireEvent.click(screen.getByTitle('inboxes.deleteInboxTitle'))

    expect(deleteInbox).not.toHaveBeenCalled()
  })
})
