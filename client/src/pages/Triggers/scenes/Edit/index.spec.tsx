import TriggerEdit from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getTrigger, updateTrigger } from '../../../../services/trigger'
import { createRoutesStub } from 'react-router'
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/trigger')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<TriggerEdit />', () => {
  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/triggers/:id',
        Component: () => (
          <AppContext.Provider value={appContextValue}>
            <TriggerEdit />
          </AppContext.Provider>
        ),
      },
      {
        path: '/triggers',
        Component: () => <div>Triggers Index</div>,
      },
    ])
    render(<Stub initialEntries={['/triggers/1']} />)
  }

  it('renders the form with the received trigger', async () => {
    getTrigger.mockResolvedValue({ status: 201, data: { id: '1', name: 'Gatilho' } })

    mount()

    await screen.findByDisplayValue('Gatilho')
  })

  it('edits the trigger', async () => {
    getTrigger.mockResolvedValue({ status: 201, data: { id: '1', name: 'Gatilho' } })

    mount()

    await screen.findByDisplayValue('Gatilho')

    fireEvent.change(screen.getByLabelText('triggers.nameLabel'), { target: { value: 'New Name' } })

    updateTrigger.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() => expect(updateTrigger).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
