import TriggerNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { createTrigger } from '../../../../services/trigger'

jest.mock('../../../../services/trigger')

describe('<TriggerNew />', () => {
  let currentUser = {
    isSuper: false,
    licensee: 'id'
  }

  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/triggers/new',
        Component: () => <TriggerNew currentUser={currentUser} />,
      },
      {
        path: '/triggers',
        Component: () => <div>Triggers Index</div>,
      },
    ])
    render(<Stub initialEntries={['/triggers/new']} />)
  }

  it('creates a new trigger when the backend returns success and user is not super', async () => {
    mount()

    createTrigger.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createTrigger).toHaveBeenCalledWith({
      name: '',
      triggerKind: 'multi_product',
      expression: '',
      catalogId: '',
      catalogMulti: '',
      licensee: 'id',
      catalogSingle: '',
      textReplyButton: '',
      messagesList: '',
      order: 1,
    }))
  })

  it('creates a new trigger when the backend returns success and user is super', async () => {
    currentUser = {
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
      catalogId: '',
      licensee: '',
      catalogSingle: '',
      textReplyButton: '',
      messagesList: '',
      order: 1,
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
