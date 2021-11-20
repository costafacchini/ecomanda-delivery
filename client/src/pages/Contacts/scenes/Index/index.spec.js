import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import ContactsIndex from './'
import { screen, waitFor } from '@testing-library/react'
import { getContacts } from '../services/contact'
import { MemoryRouter } from 'react-router';

jest.mock('../services/contact')

describe('<ContactsIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <ContactsIndex />
      </MemoryRouter>)
  }

  it('renders the licensees', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Contato' }] })

    mount()

    await waitFor(() => expect(screen.getByText('Contato')).toBeInTheDocument())
  })
})
