import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import ChatPanel from './ChatPanel'

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
  chatDefault: '',
  chatUrl: '',
  useSenderName: false,
  chatIdentifier: '',
  chatKey: '',
}

function mount(overrides = {}) {
  const values = { ...defaultValues, ...overrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <ChatPanel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
      />
    </Formik>
  )
}

describe('<ChatPanel />', () => {
  it('renders chatDefault select, chatUrl input, useSenderName checkbox', () => {
    mount()

    expect(screen.getByLabelText(/^licensees\.form\.chat\.chatDefaultLabel/)).toBeInTheDocument()
  })

  it('shows chatIdentifier and chatKey fields when chatDefault is crisp', () => {
    mount({ chatDefault: 'crisp' })

    expect(screen.getByLabelText(/^licensees\.form\.chat\.identifierLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.chat\.keyLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.chat\.chatUrlLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chat.useSenderNameLabel')).toBeInTheDocument()
  })

  it('shows chatIdentifier and chatKey fields when chatDefault is chatwoot', () => {
    mount({ chatDefault: 'chatwoot' })

    expect(screen.getByLabelText(/^licensees\.form\.chat\.identifierLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.chat\.keyLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.chat\.chatUrlLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.chat.useSenderNameLabel')).toBeInTheDocument()
  })

  it('does NOT show chatIdentifier/chatKey when chatDefault is rocketchat', () => {
    mount({ chatDefault: 'rocketchat' })

    expect(screen.queryByLabelText(/^licensees\.form\.chat\.identifierLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^licensees\.form\.chat\.keyLabel/)).not.toBeInTheDocument()
  })

  it('does NOT show chatIdentifier/chatKey/chatUrl/useSenderName when chatDefault is local', () => {
    mount({ chatDefault: 'local' })

    expect(screen.queryByLabelText(/^licensees\.form\.chat\.identifierLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^licensees\.form\.chat\.keyLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^licensees\.form\.chat\.chatUrlLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('licensees.form.chat.useSenderNameLabel')).not.toBeInTheDocument()
  })

  it('does NOT show chatIdentifier/chatKey/chatUrl/useSenderName when chatDefault is empty', () => {
    mount({ chatDefault: '' })

    expect(screen.queryByLabelText(/^licensees\.form\.chat\.identifierLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^licensees\.form\.chat\.keyLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^licensees\.form\.chat\.chatUrlLabel/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('licensees.form.chat.useSenderNameLabel')).not.toBeInTheDocument()
  })
})
