import TemplatesIndex from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getTemplates } from '../../../../services/template'
import { getLicensees } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router'
import { templateFactory } from '../../../../factories/template'
import { SimpleCrudContextProvider } from '../../../../contexts/SimpleCrud'

jest.mock('../../../../services/template')
jest.mock('../../../../services/licensee')

describe('<TemplatesIndex />', () => {
  const currentUser = { isSuper: true }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/templates',
        Component: () => <TemplatesIndex currentUser={currentUser} />,
      },
    ])
    render(
      <SimpleCrudContextProvider>
        <Stub initialEntries={['/templates']} />
      </SimpleCrudContextProvider>
    )
  }

  it('filters for all templates on it is opened and there is no previous applied filters', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build()] })

    mount({ currentUser })

    await waitFor(() => expect(getTemplates).toHaveBeenCalled())

    await screen.findByText('Templates')

    expect(getTemplates).toHaveBeenCalledWith({ page: 1 })

    expect(await screen.findByText('template')).toBeInTheDocument()
  })

  it('paginates the templates', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: templateFactory.buildList(30) })

    mount({ currentUser })

    await screen.findByText('Templates')

    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Template from new page')).toBeInTheDocument()

    expect(getTemplates).toHaveBeenCalledWith({ page: 2 })
  })

  it('filters the templates by expression', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template' })] })

    mount({ currentUser })

    await screen.findByText('Template')

    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'A template filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo template'))

    expect(await screen.findByText('A template filtered by expression')).toBeInTheDocument()

    expect(getTemplates).toHaveBeenNthCalledWith(2, { page: 1, expression: 'expression' })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template' })] })

      const currentUser = { isSuper: false }

      mount({ currentUser })

      await screen.findByText('Templates')

      await screen.findByText('Template')

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()
    })

    it('changes the filters to get the templates', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getTemplates.mockResolvedValueOnce({ status: 201, data: [templateFactory.build({ name: 'Template' })] })
      getTemplates.mockResolvedValueOnce({ status: 201, data: [templateFactory.build({ name: 'Another' })] })

      mount({ currentUser })

      await screen.findByText('Templates')

      await screen.findByText('Licenciado')

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Another')

      expect(getTemplates).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
