import TemplatesIndex from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getTemplates } from '../../../../services/template'
import { getLicensees } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router'
import { templateFactory } from '../../../../factories/template'
import { SimpleCrudContextProvider } from '../../../../contexts/SimpleCrud'
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/template')
vi.mock('../../../../services/licensee')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<TemplatesIndex />', () => {
  const currentUser = { role: 'super' }
  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/templates',
        Component: () => (
          <AppContext.Provider value={appContextValue}>
            <TemplatesIndex currentUser={currentUser} />
          </AppContext.Provider>
        ),
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

    await screen.findByText('templates.title')

    expect(getTemplates).toHaveBeenCalledWith({ page: 1 })

    expect(await screen.findByText('template')).toBeInTheDocument()
  })

  it('paginates the templates', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: templateFactory.buildList(30) })

    mount({ currentUser })

    await screen.findByText('templates.title')

    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template from new page' })] })

    fireEvent.click(await screen.findByText('common.loadMore'))

    expect(await screen.findByText('Template from new page')).toBeInTheDocument()

    expect(getTemplates).toHaveBeenCalledWith({ page: 2 })
  })

  it('filters the templates by expression', async () => {
    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template' })] })

    mount({ currentUser })

    await screen.findByText('Template')

    getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'A template filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('templates.expressionPlaceholder'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('templates.filterButtonTitle'))

    expect(await screen.findByText('A template filtered by expression')).toBeInTheDocument()

    expect(getTemplates).toHaveBeenNthCalledWith(2, { page: 1, expression: 'expression' })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      getTemplates.mockResolvedValue({ status: 201, data: [templateFactory.build({ name: 'Template' })] })

      const currentUser = { role: 'agent' }

      mount({ currentUser })

      await screen.findByText('templates.title')

      await screen.findByText('Template')

      expect(screen.queryByLabelText('templates.licenseeFilter')).not.toBeInTheDocument()
    })

    it('changes the filters to get the templates', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getTemplates.mockResolvedValueOnce({ status: 201, data: [templateFactory.build({ name: 'Template' })] })
      getTemplates.mockResolvedValueOnce({ status: 201, data: [templateFactory.build({ name: 'Another' })] })

      mount({ currentUser })

      await screen.findByText('templates.title')

      await screen.findByText('templates.licenseeFilter')

      fireEvent.change(screen.getByLabelText('templates.licenseeFilter'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Another')

      expect(getTemplates).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
