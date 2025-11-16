import LicenseeEdit from './';
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getLicensee, updateLicensee } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router';

jest.mock('../../../../services/licensee')

describe('<LicenseeEdit />', () => {
  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/licensees/:id',
        Component: LicenseeEdit,
      },
      {
        path: '/licensees',
        Component: () => <div>Licensees Index</div>,
      },
    ])
    render(<Stub initialEntries={['/licensees/1']} />)
  }

  it('renders the form with the received licensee', async () => {
    getLicensee.mockResolvedValue({ status: 201, data: { id: '1', name: 'Licenciado' } })

    mount()

    await screen.findByDisplayValue('Licenciado')
  })

  it('edits the licensees', async () => {
    getLicensee.mockResolvedValue({ status: 201, data: { id: '1', name: 'Licenciado' } })

    mount()

    await screen.findByDisplayValue('Licenciado')

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } })

    updateLicensee.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: "Salvar" }))

    await waitFor(() => expect(updateLicensee).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
