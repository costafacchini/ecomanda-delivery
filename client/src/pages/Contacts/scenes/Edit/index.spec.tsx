import ContactEdit from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getContact, updateContact } from '../../../../services/contact'
import { createRoutesStub } from 'react-router';
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/contact')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<ContactEdit />', () => {
  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/contacts/:id',
        Component: () => (
          <AppContext.Provider value={appContextValue}>
            <ContactEdit />
          </AppContext.Provider>
        ),
      },
      {
        path: '/contacts',
        Component: () => <div>Contacts Index</div>,
      },
    ])
    render(<Stub initialEntries={['/contacts/1']} />)
  }

  it('renders the form with the received contact', async () => {
    getContact.mockResolvedValue({ status: 201, data: { id: '1', name: 'Contato' } })

    mount()

    await screen.findByDisplayValue('Contato')
  })

  it('edits the contact', async () => {
    getContact.mockResolvedValue({ status: 201, data: { id: '1', name: 'Contato', number: '48999999999' } })

    mount()

    await screen.findByDisplayValue('Contato')

    fireEvent.change(screen.getByLabelText(/^contacts.nameLabel/), { target: { value: 'New Name' } })

    updateContact.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() => expect(updateContact).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
