import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import PagarMePanel from './PagarMePanel'

vi.mock('../../../../../services/licensee', () => ({
  sendLicenseePagarMe: vi.fn(),
}))

const noop = () => {}

const defaultValues = {
  financial_player_fee: 0,
  holder_name: '',
  holder_kind: '',
  holder_document: '',
  bank: '',
  branch_number: '',
  branch_check_digit: '',
  account_number: '',
  account_check_digit: '',
  account_type: '',
}

function mount({ values: valueOverrides = {}, wizardMode = false } = {}) {
  const values = { ...defaultValues, ...valueOverrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <PagarMePanel
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

describe('<PagarMePanel />', () => {
  it('renders financial_player_fee, holder_name, holder_kind select, holder_document, bank, branch_number, account_number, account_type select', () => {
    mount()

    expect(screen.getByLabelText('% Taxa')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome do titular da conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo titular da conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Documento titular da conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Banco')).toBeInTheDocument()
    expect(screen.getByLabelText('AG')).toBeInTheDocument()
    expect(screen.getByLabelText('Conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo da conta')).toBeInTheDocument()
  })

  it('shows "Integrar com a Pagar.Me" button when wizardMode is false', () => {
    mount({ wizardMode: false })

    expect(screen.getByRole('button', { name: 'Integrar com a Pagar.Me' })).toBeInTheDocument()
  })

  it('does NOT show "Integrar com a Pagar.Me" when wizardMode is true', () => {
    mount({ wizardMode: true })

    expect(screen.queryByRole('button', { name: 'Integrar com a Pagar.Me' })).not.toBeInTheDocument()
  })
})
