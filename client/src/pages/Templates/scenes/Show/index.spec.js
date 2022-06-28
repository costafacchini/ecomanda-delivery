import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import TemplateShow from '.'
import { screen } from '@testing-library/react'
import { getTemplate } from '../../../../services/template'
import { MemoryRouter } from 'react-router'

jest.mock('../../../../services/template')

describe('<TemplateShow />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <TemplateShow />
      </MemoryRouter>)
  }

  it('renders the form with the received template', async () => {
    getTemplate.mockResolvedValue({ status: 201, data: { id: '1', name: 'Template' } })

    mount()

    await screen.findByDisplayValue('Template')
  })
})
