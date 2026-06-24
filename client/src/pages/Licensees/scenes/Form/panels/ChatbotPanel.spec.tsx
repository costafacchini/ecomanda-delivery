import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import ChatbotPanel from './ChatbotPanel'

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      t: (k: string) => k,
      i18n: { language: 'pt', changeLanguage: vi.fn() },
    }),
  }
})

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

    expect(screen.getByLabelText('licensees.form.chatbot.chatbotDefaultLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotUrlLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotTokenLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotApiTokenLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chatbot.messageOnResetLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chatbot.messageOnCloseLabel')).toBeInTheDocument()
  })
})
