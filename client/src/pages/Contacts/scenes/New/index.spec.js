import ContactNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { createContact } from '../../../../services/contact'

jest.mock('../../../../services/contact')

describe('<ContactNew />', () => {
  let currentUser = {
    isSuper: false,
    licensee: 'id'
  }

  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/contacts/new',
        Component: () => <ContactNew currentUser={currentUser} />,
      },
      {
        path: '/contacts',
        Component: () => <div>Contacts Index</div>,
      },
    ])
    render(<Stub initialEntries={['/contacts/new']} />)
  }

  it('creates a new contact when the backend returns success and user is not super', async () => {
    mount()

    createContact.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createContact).toHaveBeenCalledWith({
      name: '',
      number: '',
      email: '',
      talkingWithChatBot: false,
      licensee: 'id',
      waId: '',
      landbotId: '',
      address: '',
      address_number: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      cep: '',
      ud: '',
      delivery_tax: 0,
      plugin_cart_id: ''
    }))
  })

  it('creates a new contact when the backend returns success and user is super', async () => {
    currentUser = {
      isSuper: true,
    }
    mount()

    createContact.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createContact).toHaveBeenCalledWith({
      name: '',
      number: '',
      email: '',
      talkingWithChatBot: false,
      licensee: '',
      waId: '',
      landbotId: '',
      address: '',
      address_number: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      cep: '',
      ud: '',
      delivery_tax: 0,
      plugin_cart_id: ''
    }))
  })

  it('renders the errors when the backend returns error', async () => {
    mount()

    createContact.mockResolvedValue({ status: 422, data: { errors: [{ message: 'This is an error' }] } })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})
