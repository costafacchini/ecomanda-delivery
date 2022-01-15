import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import TriggerForm from './'

describe('<TriggerForm />', () => {
  const onSubmit = jest.fn()

  function mount(props = {}) {
    render(
      <MemoryRouter>
        <TriggerForm onSubmit={onSubmit} {...props} />
      </MemoryRouter>)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Ordem')).toHaveValue(1)
    expect(screen.getByLabelText('Expressão')).toHaveValue('')
    expect(screen.getByLabelText('Tipo')).toHaveValue('multi_product')
    expect(screen.getByLabelText('Catálogo')).toHaveValue('')
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
      }

      mount({ initialValues: trigger })

      expect(screen.getByLabelText('Tipo')).toHaveValue('multi_product')
      expect(screen.getByLabelText('Catálogo')).toHaveValue('product')
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
