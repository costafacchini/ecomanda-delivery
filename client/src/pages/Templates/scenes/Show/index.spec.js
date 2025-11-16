import TemplateShow from '.'
import { screen, render } from '@testing-library/react'
import { getTemplate } from '../../../../services/template'
import { createRoutesStub } from 'react-router'

jest.mock('../../../../services/template')

describe('<TemplateShow />', () => {
  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/templates/:id',
        Component: TemplateShow,
      },
    ])
    render(<Stub initialEntries={['/templates/1']} />)
  }

  it('renders the form with the received template', async () => {
    getTemplate.mockResolvedValue({ status: 201, data: { id: '1', name: 'Template' } })

    mount()

    await screen.findByDisplayValue('Template')
  })
})
