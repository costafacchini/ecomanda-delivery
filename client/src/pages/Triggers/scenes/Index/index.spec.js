import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import TriggersIndex from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getTriggers } from '../../../../services/trigger'
import { MemoryRouter } from 'react-router'
import { triggerFactory, triggerSingleProduct, triggerReplyButton, triggerListMessage, triggerText } from '../../../../factories/trigger'

jest.mock('../../../../services/trigger')

describe('<TriggersIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <TriggersIndex  />
      </MemoryRouter>)

    return store
  }

  it('filters for all triggers on it is opened and there is no previous applied filters', async () => {
    getTriggers.mockResolvedValue(
      {
        status: 201,
        data: [
          triggerFactory.build({ _id: 1 }),
          triggerSingleProduct.build({ _id: 2 }),
          triggerReplyButton.build({ _id: 3 }),
          triggerListMessage.build({ _id: 4 }),
          triggerText.build({ _id: 5 })
        ]
      }
    )

    mount()

    await waitFor(() => expect(getTriggers).toHaveBeenCalled())

    expect(getTriggers).toHaveBeenCalledWith({
      page: 1,
      expression: '',
      licensee: '',
    })

    expect(screen.getByText('Gatilho')).toBeInTheDocument()
    expect(screen.getByText('hello-trigger')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toEqual(5)
    expect(screen.getByText('multi_product')).toBeInTheDocument()
    expect(screen.getByText('catalog')).toBeInTheDocument()
    expect(screen.getByText('single_product')).toBeInTheDocument()
    expect(screen.getByText('product')).toBeInTheDocument()
    expect(screen.getByText('reply_button')).toBeInTheDocument()
    expect(screen.getByText('buttons')).toBeInTheDocument()
    expect(screen.getByText('list_message')).toBeInTheDocument()
    expect(screen.getByText('list')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('texto')).toBeInTheDocument()
  })

  it('paginates the triggers', async () => {
    getTriggers.mockResolvedValue({ status: 201, data: triggerFactory.buildList(30) })

    mount()

    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'Trigger from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Trigger from new page')).toBeInTheDocument()

    expect(getTriggers).toHaveBeenCalledWith({
      page: 2,
      expression: '',
      licensee: '',
    })
  })

  it('filters the triggers by expression', async () => {
    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'Trigger' })] })

    mount()

    await screen.findByText('Trigger')

    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'A trigger filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo gatilho'))

    expect(await screen.findByText('A trigger filtered by expression')).toBeInTheDocument()

    expect(getTriggers).toHaveBeenNthCalledWith(2, {
      page: 1,
      expression: 'expression',
      licensee: '',
    })
  })

  // Testar a alteração do licenciado pelo componente da tela
})
