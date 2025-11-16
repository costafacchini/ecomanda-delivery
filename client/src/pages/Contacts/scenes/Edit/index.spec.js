import ContactEdit from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getContact, updateContact } from '../../../../services/contact'
import { createRoutesStub } from 'react-router';

jest.mock('../../../../services/contact')

describe('<ContactEdit />', () => {
  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/contacts/:id',
        Component: ContactEdit,
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
    getContact.mockResolvedValue({ status: 201, data: { id: '1', name: 'Contato' } })

    mount()

    await screen.findByDisplayValue('Contato')

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } })

    updateContact.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: "Salvar" }))

    await waitFor(() => expect(updateContact).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
