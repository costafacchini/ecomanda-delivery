import TriggerEdit from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getTrigger, updateTrigger } from '../../../../services/trigger'
import { createRoutesStub } from 'react-router'

jest.mock('../../../../services/trigger')

describe('<TriggerEdit />', () => {
  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/triggers/:id',
        Component: TriggerEdit,
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

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } })

    updateTrigger.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: "Salvar" }))

    await waitFor(() => expect(updateTrigger).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
