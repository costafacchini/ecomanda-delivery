import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import MainPanel from './MainPanel'

const noop = () => {}

const defaultValues = {
  name: '',
  active: false,
  kind: '',
  document: '',
  email: '',
  licenseKind: 'demo',
  phone: '',
  apiToken: '',
  urlChatWebhook: '',
  urlChatbotWebhook: '',
  urlChatbotTransfer: '',
  urlWhatsappWebhook: '',
}

function mount(overrides = {}) {
  const values = { ...defaultValues, ...overrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <MainPanel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
      />
    </Formik>
  )
}

describe('<MainPanel />', () => {
  it('renders nome, active checkbox, kind select, document, email, licenseKind select, phone, apiToken (disabled)', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Ativo')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    expect(screen.getByLabelText('Documento')).toBeInTheDocument()
    expect(screen.getByLabelText('E-email')).toBeInTheDocument()
    expect(screen.getByLabelText('Licença')).toBeInTheDocument()
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument()
    expect(screen.getByLabelText('API token')).toBeInTheDocument()
    expect(screen.getByLabelText('API token')).toBeDisabled()
  })

  it('renders webhook URL fields: urlChatWebhook, urlChatbotWebhook, urlChatbotTransfer, urlWhatsappWebhook (all disabled)', () => {
    mount()

    expect(screen.getByLabelText('URL para webhook de Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('URL para webhook de Chat')).toBeDisabled()

    expect(screen.getByLabelText('URL para webhook de Chatbot')).toBeInTheDocument()
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toBeDisabled()

    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toBeDisabled()

    expect(screen.getByLabelText('URL para webhook de whatsapp')).toBeInTheDocument()
    expect(screen.getByLabelText('URL para webhook de whatsapp')).toBeDisabled()
  })
})
