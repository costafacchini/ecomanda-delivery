import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { importTriggerMultiProduct } from '../../../../services/trigger'
import TriggerImportation from './'

vi.mock('../../../../services/trigger')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<TriggerImportation />', () => {
  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/triggers/:id/importation',
        Component: TriggerImportation,
      },
      {
        path: '/triggers',
        Component: () => <div>Triggers Index</div>,
      },
    ])
    render(<Stub initialEntries={['/triggers/1/importation']} />)
  }

  it('renders the form', async () => {
    mount()

    expect(screen.getByLabelText('triggers.catalogLabel')).toBeInTheDocument()
    expect(screen.getByText('triggers.importButton')).toBeInTheDocument()
    expect(screen.getByText('common.back')).toBeInTheDocument()
  })

  it('imports a catalog when the backend returns success', async () => {
    mount()

    fireEvent.change(screen.getByLabelText('triggers.catalogLabel'), { target: { value: '83863 Double Monster Bacon' } })

    importTriggerMultiProduct.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByText('triggers.importButton'))

    await waitFor(() => expect(importTriggerMultiProduct).toHaveBeenCalledWith("1", { text: '83863 Double Monster Bacon' }))
  })

  it('renders the errors when the backend returns error', async () => {
    mount()

    importTriggerMultiProduct.mockResolvedValue({ status: 500, data: { errors: [{ message: 'This is an error' }] } })

    fireEvent.click(screen.getByText('triggers.importButton'))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})