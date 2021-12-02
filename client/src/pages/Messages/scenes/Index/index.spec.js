import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import MessageIndex from './'
import { screen, waitFor } from '@testing-library/react'
import { getMessages } from '../../../../services/message'
import { MemoryRouter } from 'react-router'

jest.mock('../../../../services/message')

describe('<MessageIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <MessageIndex />
      </MemoryRouter>)
  }

  it('renders the messages', async () => {
    getMessages.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Mensagem' }] })

    mount()

    await waitFor(() => expect(screen.getByText('Mensagem')).toBeInTheDocument())
  })
})
