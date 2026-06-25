import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import TriggerForm from './'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<TriggerForm />', () => {
  const onSubmit = vi.fn()

  function mount(props = {}) {
    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => <TriggerForm onSubmit={onSubmit} {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('triggers.nameLabel')).toHaveValue('')
    expect(screen.getByLabelText('triggers.orderLabel')).toHaveValue(1)
    expect(screen.getByLabelText('triggers.expressionLabel')).toHaveValue('')
    expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('multi_product')
    expect(screen.getByLabelText('triggers.catalogLabel')).toHaveValue('')

    expect(screen.queryByText('triggers.textHelpTitle')).not.toBeInTheDocument()
    expect(screen.queryByText('triggers.textHelpCartResume')).not.toBeInTheDocument()
    expect(screen.queryByText('triggers.textHelpContactName')).not.toBeInTheDocument()
    expect(screen.queryByText('triggers.textHelpContactNumber')).not.toBeInTheDocument()
    expect(screen.queryByText('triggers.textHelpContactAddress')).not.toBeInTheDocument()
  })

  it('can receive initial values', () => {
    const trigger = {
      name: 'Name',
      triggerKind: 'multi_product',
      expression: 'multiple-products',
      catalogMulti: 'products',
      order: 2
    }

    mount({ initialValues: trigger })

    expect(screen.getByLabelText('triggers.nameLabel')).toHaveValue('Name')
    expect(screen.getByLabelText('triggers.orderLabel')).toHaveValue(2)
    expect(screen.getByLabelText('triggers.expressionLabel')).toHaveValue('multiple-products')
    expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('multi_product')
    expect(screen.getByLabelText('triggers.catalogLabel')).toHaveValue('products')
  })

  describe('fields', () => {
    it('renders fields if kind is multi_product', () => {
      const trigger = {
        triggerKind: 'multi_product',
        catalogMulti: 'product',
        catalogId: '123457'
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('multi_product')
      expect(screen.getByLabelText('triggers.catalogLabel')).toHaveValue('product')
      expect(screen.getByLabelText('triggers.catalogIdLabel')).toHaveValue('123457')
    })

    it('renders fields if kind is single_product', () => {
      const trigger = {
        triggerKind: 'single_product',
        catalogSingle: 'product',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('single_product')
      expect(screen.getByLabelText('triggers.catalogLabel')).toHaveValue('product')
    })

    it('renders fields if kind is reply_button', () => {
      const trigger = {
        triggerKind: 'reply_button',
        textReplyButton: 'buttons',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('reply_button')
      expect(screen.getByLabelText('triggers.scriptLabel')).toHaveValue('buttons')
    })

    it('renders fields if kind is list_message', () => {
      const trigger = {
        triggerKind: 'list_message',
        messagesList: 'messages',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('list_message')
      expect(screen.getByLabelText('triggers.messagesLabel')).toHaveValue('messages')
    })

    it('renders fields if kind is text', () => {
      const trigger = {
        triggerKind: 'text',
        text: 'messages',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('triggers.kindLabel')).toHaveValue('text')
      expect(screen.getByLabelText('triggers.textLabel')).toHaveValue('messages')
      expect(screen.getByText('triggers.textHelpTitle')).toBeInTheDocument()
      expect(screen.getByText('triggers.textHelpCartResume')).toBeInTheDocument()
      expect(screen.getByText('triggers.textHelpContactName')).toBeInTheDocument()
      expect(screen.getByText('triggers.textHelpContactNumber')).toBeInTheDocument()
      expect(screen.getByText('triggers.textHelpContactAddress')).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('common.save'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
        name: '',
        triggerKind: 'multi_product',
        expression: '',
        catalogId: '',
        catalogMulti: '',
        licensee: '',
        catalogSingle: '',
        textReplyButton: '',
        messagesList: '',
        order: 1,
      })
    })
  })
})
