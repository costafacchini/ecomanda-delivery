import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import ContactForm from './'

describe('<ContactForm />', () => {
  const onSubmit = jest.fn()

  function mount(props = {}) {
    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => <ContactForm onSubmit={onSubmit} {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('E-email')).toHaveValue('')
    expect(screen.getByLabelText('Telefone')).toHaveValue('')
    expect(screen.getByLabelText('Conversando com chatbot?')).not.toBeChecked()
    expect(screen.getByLabelText('ID da API oficial do whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('ID do contato na landbot')).toHaveValue('')
    expect(screen.getByLabelText('Cep')).toHaveValue('')
    expect(screen.getByLabelText('Cidade')).toHaveValue('')
    expect(screen.getByLabelText('UF')).toHaveValue('')
    expect(screen.getByLabelText('Endereço')).toHaveValue('')
    expect(screen.getByLabelText('Número')).toHaveValue('')
    expect(screen.getByLabelText('Complemento')).toHaveValue('')
    expect(screen.getByLabelText('Bairro')).toHaveValue('')
    expect(screen.getByLabelText('Taxa de entrega')).toHaveValue(0)
    expect(screen.getByLabelText('Id no plugin de carrinho')).toHaveValue('')
  })

  it('can receive initial values', () => {
    const contact = {
      name: 'Name',
      email: 'email@gmail.com',
      number: '48999999215',
      talkingWithChatBot: true,
      waId: 'waId',
      landbotId: 'landbotId',
      address: 'Avenida Coronel Adolfo Lustosa 475',
      address_number: '784',
      address_complement: 'Próximo ao centro',
      neighborhood: 'Centro',
      city: 'Alto Parnaíba',
      cep: '65810970',
      uf: 'MA',
      delivery_tax: 14.6,
      plugin_cart_id: '12356'
    }

    mount({ initialValues: contact })

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('E-email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText('Telefone')).toHaveValue('48999999215')
    expect(screen.getByLabelText('Conversando com chatbot?')).toBeChecked()
    expect(screen.getByLabelText('ID da API oficial do whatsapp')).toHaveValue('waId')
    expect(screen.getByLabelText('ID do contato na landbot')).toHaveValue('landbotId')
    expect(screen.getByLabelText('Cep')).toHaveValue('65810970')
    expect(screen.getByLabelText('Cidade')).toHaveValue('Alto Parnaíba')
    expect(screen.getByLabelText('UF')).toHaveValue('MA')
    expect(screen.getByLabelText('Endereço')).toHaveValue('Avenida Coronel Adolfo Lustosa 475')
    expect(screen.getByLabelText('Número')).toHaveValue('784')
    expect(screen.getByLabelText('Complemento')).toHaveValue('Próximo ao centro')
    expect(screen.getByLabelText('Bairro')).toHaveValue('Centro')
    expect(screen.getByLabelText('Taxa de entrega')).toHaveValue(14.6)
    expect(screen.getByLabelText('Id no plugin de carrinho')).toHaveValue('12356')
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
        address: '',
        address_number: '',
        address_complement: '',
        neighborhood: '',
        city: '',
        cep: '',
        ud: '',
        delivery_tax: 0,
        plugin_cart_id: ''
      })
    })
  })
})
