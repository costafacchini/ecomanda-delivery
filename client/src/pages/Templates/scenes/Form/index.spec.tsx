import { render, screen } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import TemplateForm from './'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

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

    expect(screen.getByLabelText('templates.nameLabel')).toHaveValue('')
    expect(screen.getByLabelText('templates.namespaceLabel')).toHaveValue('')
    expect(screen.getByLabelText('templates.nameLabel')).toBeDisabled()
    expect(screen.getByLabelText('templates.namespaceLabel')).toBeDisabled()
  })

  it('can receive initial values', () => {
    const template = {
      name: 'template',
      namespace: 'Namespace',
    }

    mount({ initialValues: template })

    expect(screen.getByLabelText('templates.nameLabel')).toHaveValue('template')
    expect(screen.getByLabelText('templates.namespaceLabel')).toHaveValue('Namespace')
  })
})
