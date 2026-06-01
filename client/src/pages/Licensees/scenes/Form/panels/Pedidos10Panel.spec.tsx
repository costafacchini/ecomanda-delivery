import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import Pedidos10Panel from './Pedidos10Panel'

vi.mock('../../../../../services/licensee', () => ({
  signOrderWebhook: vi.fn(),
}))

const noop = () => {}

const defaultValues = {
  pedidos10_integrator: '',
  pedidos10_integration: '',
}

function mount({ values: valueOverrides = {}, wizardMode = false } = {}) {
  const values = { ...defaultValues, ...valueOverrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <Pedidos10Panel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
        wizardMode={wizardMode}
      />
    </Formik>
  )
}

describe('<Pedidos10Panel />', () => {
  it('renders pedidos10_integrator select and pedidos10_integration textarea', () => {
    mount()

    expect(screen.getByLabelText('Software Integrador')).toBeInTheDocument()
    expect(screen.getByLabelText('Dados da integração')).toBeInTheDocument()
  })

  it('shows "Assinar Webhook P10" button when wizardMode is false', () => {
    mount({ wizardMode: false })

    expect(screen.getByRole('button', { name: 'Assinar Webhook P10' })).toBeInTheDocument()
  })

  it('does NOT show "Assinar Webhook P10" button when wizardMode is true', () => {
    mount({ wizardMode: true })

    expect(screen.queryByRole('button', { name: 'Assinar Webhook P10' })).not.toBeInTheDocument()
  })
})
