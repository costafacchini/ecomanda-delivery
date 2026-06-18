import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import ChatbotPanel from './ChatbotPanel'

const noop = () => {}

const defaultValues = {
  chatbotDefault: '',
  chatbotUrl: '',
  chatbotAuthorizationToken: '',
  chatbotApiToken: '',
  messageOnResetChatbot: '',
  messageOnCloseChat: '',
}

function mount(overrides = {}) {
  const values = { ...defaultValues, ...overrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <ChatbotPanel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
      />
    </Formik>
  )
}

describe('<ChatbotPanel />', () => {
  it('renders chatbotDefault select, chatbotUrl, chatbotAuthorizationToken, chatbotApiToken, messageOnResetChatbot, messageOnCloseChat', () => {
    mount({ chatbotDefault: 'landbot' })

    expect(screen.getByLabelText('Chatbot padrão')).toBeInTheDocument()
    expect(screen.getByLabelText('URL do chatbot')).toBeInTheDocument()
    expect(screen.getByLabelText('Token do chatbot')).toBeInTheDocument()
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem de encerramento de chat')).toBeInTheDocument()
  })
})
