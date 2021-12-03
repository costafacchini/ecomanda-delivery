import TriggerNew from '.'
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createTrigger } from '../../../../services/trigger'

jest.mock('../../../../services/trigger')

describe('<TriggerNew />', () => {
  let loggedUser = {
    isSuper: false,
    licensee: 'id'
  }

  function mount() {
    render(
      <MemoryRouter>
        <TriggerNew loggedUser={loggedUser} />
      </MemoryRouter>)
  }

  it('creates a new trigger when the backend returns success', async () => {
    mount()

    createTrigger.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createTrigger).toHaveBeenCalledWith({
      name: '',
      triggerKind: 'multi_product',
      expression: '',
      catalogMulti: '',
      licensee: 'id',
      catalogSingle: '',
      textReplyButton: '',
      messagesList: '',
    }))

    cleanup()

    loggedUser = {
      isSuper: true,
    }
    mount()

    createTrigger.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createTrigger).toHaveBeenCalledWith({
      name: '',
      triggerKind: 'multi_product',
      expression: '',
      catalogMulti: '',
      licensee: '',
      catalogSingle: '',
      textReplyButton: '',
      messagesList: '',
    }))
  })

  it('renders the errors when the backend returns error', async () => {
    mount()

    createTrigger.mockResolvedValue({ status: 422, data: { errors: [{ message: 'This is an error' }] } })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})
