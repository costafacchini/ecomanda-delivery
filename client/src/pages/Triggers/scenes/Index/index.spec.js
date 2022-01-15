import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import TriggersIndex from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getTriggers } from '../../../../services/trigger'
import { MemoryRouter } from 'react-router'
import { triggerFactory } from '../../../../factories/trigger'

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
    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build()] })

    mount()

    await waitFor(() => expect(getTriggers).toHaveBeenCalled())

    expect(getTriggers).toHaveBeenCalledWith({
      page: 1,
      expression: '',
      licensee: '',
    })

    expect(screen.getByText('Gatilho')).toBeInTheDocument()
    expect(screen.getByText('hello-trigger')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('multi_product')).toBeInTheDocument()
    expect(screen.getByText('catalog')).toBeInTheDocument()
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
