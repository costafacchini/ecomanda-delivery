import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import TemplatesIndex from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getTemplates } from '../../../../services/template'
import { getLicensees } from '../../../../services/licensee'
import { MemoryRouter } from 'react-router'
import { templateFactory } from '../../../../factories/template'

jest.mock('../../../../services/template')
jest.mock('../../../../services/licensee')

describe('<TemplatesIndex />', () => {
  function mount() {
    const loggedUser = {
      isSuper: true
    }

    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <TemplatesIndex loggedUser={loggedUser} />
      </MemoryRouter>)

    return store
  }

  it('filters for all templates on it is opened and there is no previous applied filters', async () => {
    getTemplates.mockResolvedValue(
      {
        status: 201,
        data: [
          templateFactory.build({ sequence: 1 }),
        ]
      }
    )

    mount()

    await waitFor(() => expect(getTemplates).toHaveBeenCalled())

    await screen.findByText('Templates')

    expect(getTemplates).toHaveBeenCalledWith({
      page: 1,
      expression: '',
      licensee: '',
    })

    expect(await screen.findByText('template')).toBeInTheDocument()
  })

  it('paginates the templates', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: templateFactory.buildList(30) })

    mount()

    await screen.findByText('Templates')

    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Template from new page')).toBeInTheDocument()

    expect(getTemplates).toHaveBeenCalledWith({
      page: 2,
      expression: '',
      licensee: '',
    })
  })

  it('filters the templates by expression', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template' })] })

    mount()

    await screen.findByText('Template')

    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'A template filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo template'))

    expect(await screen.findByText('A template filtered by expression')).toBeInTheDocument()

    expect(getTemplates).toHaveBeenNthCalledWith(2, {
      page: 1,
      expression: 'expression',
      licensee: '',
    })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      const loggedUser = {
        isSuper: false
      }

      const store = createStore()
      mountWithRedux(store)(
        <MemoryRouter>
          <TemplatesIndex loggedUser={loggedUser} />
        </MemoryRouter>)

      await screen.findByText('Templates')

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()
    })

    it('changes the filters to get the templates', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getTemplates.mockResolvedValue(
        {
          status: 201,
          data: [
            templateFactory.build({ _id: 1 }),
            templateFactory.build({ _id: 2 }),
            templateFactory.build({ _id: 3 }),
          ]
        }
      )

      mount()

      await screen.findByText('Templates')

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Templates')

      expect(getTemplates).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
