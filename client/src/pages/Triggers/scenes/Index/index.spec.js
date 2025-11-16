import TriggersIndex from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getTriggers } from '../../../../services/trigger'
import { getLicensees } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router'
import { triggerFactory, triggerSingleProduct, triggerReplyButton, triggerListMessage, triggerText } from '../../../../factories/trigger'
import { SimpleCrudContextProvider } from '../../../../contexts/SimpleCrud'

jest.mock('../../../../services/trigger')
jest.mock('../../../../services/licensee')

describe('<TriggersIndex />', () => {
  const currentUser = { isSuper: true }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/triggers',
        Component: () => <TriggersIndex currentUser={currentUser} />,
      },
    ])
    render(
      <SimpleCrudContextProvider>
        <Stub initialEntries={['/triggers']} />
      </SimpleCrudContextProvider>
    )
  }

  it('filters for all triggers on it is opened and there is no previous applied filters', async () => {
    getTriggers.mockResolvedValue(
      {
        status: 201,
        data: [
          triggerFactory.build({ id: 1 }),
          triggerSingleProduct.build({ id: 2 }),
          triggerReplyButton.build({ id: 3 }),
          triggerListMessage.build({ id: 4 }),
          triggerText.build({ id: 5 })
        ]
      }
    )

    mount({ currentUser })

    await waitFor(() => expect(getTriggers).toHaveBeenCalled())

    await screen.findByText('Gatilhos')

    expect(getTriggers).toHaveBeenCalledWith({ page: 1 })

    expect(await screen.findByText('Gatilho')).toBeInTheDocument()
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

    mount({ currentUser })

    await screen.findByText('Gatilhos')

    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'Trigger from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Trigger from new page')).toBeInTheDocument()

    expect(getTriggers).toHaveBeenCalledWith({ page: 2 })
  })

  it('filters the triggers by expression', async () => {
    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'Trigger' })] })

    mount({ currentUser })

    await screen.findByText('Trigger')

    getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'A trigger filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo gatilho'))

    expect(await screen.findByText('A trigger filtered by expression')).toBeInTheDocument()

    expect(getTriggers).toHaveBeenNthCalledWith(2, { page: 1, expression: 'expression' })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      getTriggers.mockResolvedValue({ status: 201, data: [triggerFactory.build({ name: 'Trigger' })] })

      const currentUser = { isSuper: false }

      mount({ currentUser })

      await screen.findByText('Gatilhos')

      await screen.findByText('Trigger')

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()
    })

    it('changes the filters to get the triggers', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getTriggers.mockResolvedValueOnce({ status: 201, data: [triggerFactory.build({ name: 'Trigger' })] })
      getTriggers.mockResolvedValueOnce({ status: 201, data: [triggerFactory.build({ name: 'Another' })] })

      mount({ currentUser })

      await screen.findByText('Gatilhos')

      await screen.findByText('Licenciado')

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Another')

      expect(getTriggers).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
