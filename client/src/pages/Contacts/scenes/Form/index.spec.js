import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ContactForm from './'

describe('<ContactForm />', () => {
  const onSubmit = jest.fn()

  function mount(props = {}) {
    render(
      <MemoryRouter>
        <ContactForm onSubmit={onSubmit} {...props} />
      </MemoryRouter>)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('E-email')).toHaveValue('')
    expect(screen.getByLabelText('Telefone')).toHaveValue('')
    expect(screen.getByLabelText('Conversando com chatbot?')).not.toBeChecked()
    expect(screen.getByLabelText('ID da API oficial do whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('ID do contato na landbot')).toHaveValue('')
  })

  it('can receive initial values', () => {
    const contact = {
      name: 'Name',
      email: 'email@gmail.com',
      number: '48999999215',
      talkingWithChatBot: true,
      waId: 'waId',
      landbotId: 'landbotId',
    }

    mount({ initialValues: contact })

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('E-email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText('Telefone')).toHaveValue('48999999215')
    expect(screen.getByLabelText('Conversando com chatbot?')).toBeChecked()
    expect(screen.getByLabelText('ID da API oficial do whatsapp')).toHaveValue('waId')
    expect(screen.getByLabelText('ID do contato na landbot')).toHaveValue('landbotId')
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Salvar'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
        name: '',
        number: '',
        email: '',
        talkingWithChatBot: false,
        licensee: '',
        waId: '',
        landbotId: '',
      })
    })
  })
})
