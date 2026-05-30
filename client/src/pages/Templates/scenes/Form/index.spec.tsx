import { render, screen } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import TemplateForm from './'

describe('<TemplateForm />', () => {
  function mount(props = {}) {
    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => <TemplateForm {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Namespace')).toHaveValue('')
    expect(screen.getByLabelText('Nome')).toBeDisabled()
    expect(screen.getByLabelText('Namespace')).toBeDisabled()
  })

  it('can receive initial values', () => {
    const template = {
      name: 'template',
      namespace: 'Namespace',
    }

    mount({ initialValues: template })

    expect(screen.getByLabelText('Nome')).toHaveValue('template')
    expect(screen.getByLabelText('Namespace')).toHaveValue('Namespace')
  })
})
