import TemplateShow from '.'
import { screen, render } from '@testing-library/react'
import { getTemplate } from '../../../../services/template'
import { createRoutesStub } from 'react-router'
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/template')

describe('<TemplateShow />', () => {
  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/templates/:id',
        Component: () => (
          <AppContext.Provider value={appContextValue}>
            <TemplateShow />
          </AppContext.Provider>
        ),
      },
    ])
    render(<Stub initialEntries={['/templates/1']} />)
  }

  it('renders the form with the received template', async () => {
    getTemplate.mockResolvedValue({ status: 201, data: { id: '1', name: 'Template' } })

    mount()

    await screen.findByDisplayValue('Template')
  })
})
