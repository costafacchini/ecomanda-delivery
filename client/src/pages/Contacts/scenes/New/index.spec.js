import ContactNew from '.'
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createContact } from '../../../../services/contact'

jest.mock('../../../../services/contact')

describe('<ContactNew />', () => {
  let currentUser = {
    isSuper: false,
    licensee: 'id'
  }

  function mount() {
    render(
      <MemoryRouter>
        <ContactNew currentUser={currentUser} />
      </MemoryRouter>)
  }

  it('creates a new contact when the backend returns success', async () => {
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

    cleanup()

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
