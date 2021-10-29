import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import LicenseeNew from './';
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getLicensee, updateLicensee } from '../../../../services/licensees'
import { MemoryRouter } from 'react-router';

jest.mock('../../../../services/licensees')

describe('<LicenseeNew />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <LicenseeNew />
      </MemoryRouter>)
  }

  it('renders the form with the received licensee', async () => {
    getLicensee.mockResolvedValue({ status: 201, data: { id: '1', name: 'Licenciado' } })

    mount()

    await waitFor(() => expect(screen.getByDisplayValue('Licenciado')).toBeInTheDocument())
  })

  it('edits the licensees', async () => {
    getLicensee.mockResolvedValue({ status: 201, data: { id: '1', name: 'Licenciado' } })

    mount()

    await waitFor(() => expect(screen.getByDisplayValue('Licenciado')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } })

    updateLicensee.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: "Salvar" }))

    await waitFor(() => expect(updateLicensee).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))

  })
})
