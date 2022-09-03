import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import TemplateForm from './'

describe('<TemplateForm />', () => {
  function mount(props = {}) {
    render(
      <MemoryRouter>
        <TemplateForm {...props} />
      </MemoryRouter>)
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
