import ContactNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createContact } from '../services/contact'

jest.mock('../services/contact')

describe('<ContactNew />', () => {
  function mount() {
    render(
      <MemoryRouter>
        <ContactNew />
      </MemoryRouter>)
  }

  it('creates a new contact when the backend returns success', async () => {
    mount()

    createContact.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createContact).toHaveBeenCalledWith({
      name: '',
      email: '',
      phone: '',
      active: false,
      apiToken: '',
      licenseKind: 'demo',
      useChatbot: false,
      chatbotDefault: '',
      chatbotUrl: '',
      chatbotAuthorizationToken: '',
      messageOnResetChatbot: '',
      chatbotApiToken: '',
      whatsappDefault: '',
      whatsappToken: '',
      whatsappUrl: '',
      chatDefault: '',
      chatIdentifier: '',
      chatKey: '',
      chatUrl: '',
      awsId: '',
      awsSecret: '',
      bucketName: '',
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
