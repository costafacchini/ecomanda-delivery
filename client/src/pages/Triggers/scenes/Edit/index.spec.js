import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import TriggerEdit from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getTrigger, updateTrigger } from '../../../../services/trigger'
import { MemoryRouter } from 'react-router'

jest.mock('../../../../services/trigger')

describe('<TriggerEdit />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <TriggerEdit />
      </MemoryRouter>)
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

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } })

    updateTrigger.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: "Salvar" }))

    await waitFor(() => expect(updateTrigger).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
