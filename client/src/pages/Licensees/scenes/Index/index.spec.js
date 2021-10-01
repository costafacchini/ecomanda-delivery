import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import LicenseeNew from './';
import { screen, waitFor } from '@testing-library/react'
import { getLicensees } from '../services/licensee'
import { MemoryRouter } from 'react-router';

jest.mock('../services/licensee')

describe('<LicenseeNew />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <LicenseeNew />
      </MemoryRouter>)
  }

  it('renders the licensees', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Licenciado' }] })

    mount()

    await waitFor(() => expect(screen.getByText('Licenciado')).toBeInTheDocument())
  })
})
