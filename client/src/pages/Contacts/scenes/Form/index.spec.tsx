import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import ContactForm from './'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<ContactForm />', () => {
  const onSubmit = vi.fn()

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

    expect(screen.getByLabelText(/^contacts.nameLabel/)).toHaveValue('')
    expect(screen.getByLabelText('common.email')).toHaveValue('')
    expect(screen.getByLabelText(/^contacts.phoneLabel/)).toHaveValue('')
    expect(screen.getByLabelText('contacts.chatbotLabel')).not.toBeChecked()
    expect(screen.getByLabelText(/^contacts.waIdLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^contacts.landbotIdLabel/)).toHaveValue('')
    expect(screen.getByLabelText('contacts.cepLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.cityLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.ufLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.addressLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.addressNumberLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.complementLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.neighborhoodLabel')).toHaveValue('')
    expect(screen.getByLabelText('contacts.deliveryTaxLabel')).toHaveValue(0)
    expect(screen.getByLabelText(/^contacts.pluginCartIdLabel/)).toHaveValue('')
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

    expect(screen.getByLabelText(/^contacts.nameLabel/)).toHaveValue('Name')
    expect(screen.getByLabelText('common.email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText(/^contacts.phoneLabel/)).toHaveValue('48999999215')
    expect(screen.getByLabelText('contacts.chatbotLabel')).toBeChecked()
    expect(screen.getByLabelText(/^contacts.waIdLabel/)).toHaveValue('waId')
    expect(screen.getByLabelText(/^contacts.landbotIdLabel/)).toHaveValue('landbotId')
    expect(screen.getByLabelText('contacts.cepLabel')).toHaveValue('65810970')
    expect(screen.getByLabelText('contacts.cityLabel')).toHaveValue('Alto Parnaíba')
    expect(screen.getByLabelText('contacts.ufLabel')).toHaveValue('MA')
    expect(screen.getByLabelText('contacts.addressLabel')).toHaveValue('Avenida Coronel Adolfo Lustosa 475')
    expect(screen.getByLabelText('contacts.addressNumberLabel')).toHaveValue('784')
    expect(screen.getByLabelText('contacts.complementLabel')).toHaveValue('Próximo ao centro')
    expect(screen.getByLabelText('contacts.neighborhoodLabel')).toHaveValue('Centro')
    expect(screen.getByLabelText('contacts.deliveryTaxLabel')).toHaveValue(14.6)
    expect(screen.getByLabelText(/^contacts.pluginCartIdLabel/)).toHaveValue('12356')
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.change(screen.getByLabelText(/^contacts.nameLabel/), { target: { value: 'Test Contact' } })
      fireEvent.change(screen.getByLabelText(/^contacts.phoneLabel/), { target: { value: '48999999999' } })

      fireEvent.click(screen.getByText('common.save'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Contact',
        number: '48999999999',
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
