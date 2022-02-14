import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import TriggerImportation from './'

describe('<TriggerImportation />', () => {
  function mount() {
    render(
      <MemoryRouter>
        <TriggerImportation />
      </MemoryRouter>)
  }

  it('renders the form', async () => {
    mount()

    expect(screen.getByLabelText('Catálogo')).toBeInTheDocument()
  })
})