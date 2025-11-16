import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { importTriggerMultiProduct } from '../../../../services/trigger'
import TriggerImportation from './'

jest.mock('../../../../services/trigger')

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

    expect(screen.getByLabelText('Catálogo')).toBeInTheDocument()
    expect(screen.getByText('Importar')).toBeInTheDocument()
    expect(screen.getByText('Voltar')).toBeInTheDocument()
  })

  it('imports a catalog when the backend returns success', async () => {
    mount()

    fireEvent.change(screen.getByLabelText('Catálogo'), { target: { value: '83863 Double Monster Bacon' } })

    importTriggerMultiProduct.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByText('Importar'))

    await waitFor(() => expect(importTriggerMultiProduct).toHaveBeenCalledWith("1", { text: '83863 Double Monster Bacon' }))
  })

  it('renders the errors when the backend returns error', async () => {
    mount()

    importTriggerMultiProduct.mockResolvedValue({ status: 500, data: { errors: [{ message: 'This is an error' }] } })

    fireEvent.click(screen.getByText('Importar'))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})