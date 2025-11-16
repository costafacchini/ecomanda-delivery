import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import TriggerForm from './'

describe('<TriggerForm />', () => {
  const onSubmit = jest.fn()

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

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Ordem')).toHaveValue(1)
    expect(screen.getByLabelText('Expressão')).toHaveValue('')
    expect(screen.getByLabelText('Tipo')).toHaveValue('multi_product')
    expect(screen.getByLabelText('Catálogo')).toHaveValue('')

    expect(screen.queryByText('O campo de texto aceita algumas palavras reservadas:')).not.toBeInTheDocument()
    expect(screen.queryByText('$last_cart_resume - carrinho do contato')).not.toBeInTheDocument()
    expect(screen.queryByText('$contact_name - nome do contato')).not.toBeInTheDocument()
    expect(screen.queryByText('$contact_number - número de telefone do contato')).not.toBeInTheDocument()
    expect(screen.queryByText('$contact_address_complete - endereço completo do contato')).not.toBeInTheDocument()
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

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('Ordem')).toHaveValue(2)
    expect(screen.getByLabelText('Expressão')).toHaveValue('multiple-products')
    expect(screen.getByLabelText('Tipo')).toHaveValue('multi_product')
    expect(screen.getByLabelText('Catálogo')).toHaveValue('products')
  })

  describe('fields', () => {
    it('renders fields if kind is multi_product', () => {
      const trigger = {
        triggerKind: 'multi_product',
        catalogMulti: 'product',
        catalogId: '123457'
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('Tipo')).toHaveValue('multi_product')
      expect(screen.getByLabelText('Catálogo')).toHaveValue('product')
      expect(screen.getByLabelText('Id do catálogo')).toHaveValue('123457')
    })

    it('renders fields if kind is single_product', () => {
      const trigger = {
        triggerKind: 'single_product',
        catalogSingle: 'product',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('Tipo')).toHaveValue('single_product')
      expect(screen.getByLabelText('Catálogo')).toHaveValue('product')
    })

    it('renders fields if kind is reply_button', () => {
      const trigger = {
        triggerKind: 'reply_button',
        textReplyButton: 'buttons',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('Tipo')).toHaveValue('reply_button')
      expect(screen.getByLabelText('Script')).toHaveValue('buttons')
    })

    it('renders fields if kind is list_message', () => {
      const trigger = {
        triggerKind: 'list_message',
        messagesList: 'messages',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('Tipo')).toHaveValue('list_message')
      expect(screen.getByLabelText('Mensagens')).toHaveValue('messages')
    })

    it('renders fields if kind is text', () => {
      const trigger = {
        triggerKind: 'text',
        text: 'messages',
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('Tipo')).toHaveValue('text')
      expect(screen.getByLabelText('Texto')).toHaveValue('messages')
      expect(screen.getByText('O campo de texto aceita algumas palavras reservadas:')).toBeInTheDocument()
      expect(screen.getByText('$last_cart_resume - carrinho do contato')).toBeInTheDocument()
      expect(screen.getByText('$contact_name - nome do contato')).toBeInTheDocument()
      expect(screen.getByText('$contact_number - número de telefone do contato')).toBeInTheDocument()
      expect(screen.getByText('$contact_address_complete - endereço completo do contato')).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Salvar'))

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
