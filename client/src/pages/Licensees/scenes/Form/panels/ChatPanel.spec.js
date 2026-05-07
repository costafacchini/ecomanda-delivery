import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import ChatPanel from './ChatPanel'

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

    expect(screen.getByLabelText('Chat padrão')).toBeInTheDocument()
    expect(screen.getByLabelText('Url do chat')).toBeInTheDocument()
    expect(screen.getByLabelText('Usa o remetente no nome do chat?')).toBeInTheDocument()
  })

  it('shows chatIdentifier and chatKey fields when chatDefault is crisp', () => {
    mount({ chatDefault: 'crisp' })

    expect(screen.getByLabelText('Identifier')).toBeInTheDocument()
    expect(screen.getByLabelText('Key')).toBeInTheDocument()
  })

  it('shows chatIdentifier and chatKey fields when chatDefault is chatwoot', () => {
    mount({ chatDefault: 'chatwoot' })

    expect(screen.getByLabelText('Identifier')).toBeInTheDocument()
    expect(screen.getByLabelText('Key')).toBeInTheDocument()
  })

  it('does NOT show chatIdentifier/chatKey when chatDefault is rocketchat', () => {
    mount({ chatDefault: 'rocketchat' })

    expect(screen.queryByLabelText('Identifier')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Key')).not.toBeInTheDocument()
  })

  it('does NOT show chatIdentifier/chatKey when chatDefault is empty', () => {
    mount({ chatDefault: '' })

    expect(screen.queryByLabelText('Identifier')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Key')).not.toBeInTheDocument()
  })
})
