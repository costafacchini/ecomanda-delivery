import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import ContactsIndex from './'
import { screen, waitFor } from '@testing-library/react'
import { getContacts } from '../services/contact'
import { fetchContacts } from './slice'
import { MemoryRouter } from 'react-router'

jest.mock('../services/contact')

describe('<ContactsIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <ContactsIndex />
      </MemoryRouter>)

    return store
  }

  it('filters for all contacts on it is opened and there is no previous applied filters', () => {
    const store = mount()

    expect(store.getActions()).toContainEqual({
      type: 'users/fetchContactsStatus',
      payload: {
        page: 1,
        expression: '',
      },
    })
  })

  it('renders the licensees', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Contato' }] })

    mount()

    await waitFor(() => expect(screen.getByText('Contato')).toBeInTheDocument())
  })
})
