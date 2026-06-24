import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import MainPanel from './MainPanel'

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      t: (k: string) => k,
      i18n: { language: 'pt', changeLanguage: vi.fn() },
    }),
  }
})

const noop = () => {}

const defaultValues = {
  name: '',
  active: false,
  kind: '',
  document: '',
  email: '',
  licenseKind: 'demo',
  phone: '',
  apiToken: '',
  urlChatWebhook: '',
  urlChatbotWebhook: '',
  urlChatbotTransfer: '',
  urlWhatsappWebhook: '',
}

function mount(overrides = {}) {
  const values = { ...defaultValues, ...overrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <MainPanel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
      />
    </Formik>
  )
}

describe('<MainPanel />', () => {
  it('renders nome, active checkbox, kind select, document, email, licenseKind select, phone, apiToken (disabled)', () => {
    mount()

    expect(screen.getByLabelText(/^licensees\.form\.nameLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.activeLabel')).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.kindLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.documentLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.emailLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.licenseKindLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.phoneLabel/)).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.apiTokenLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.apiTokenLabel')).toHaveAttribute('readonly')
  })

  it('renders webhook URL fields: urlChatWebhook, urlChatbotWebhook, urlChatbotTransfer, urlWhatsappWebhook (all disabled)', () => {
    mount()

    expect(screen.getByLabelText('licensees.form.webhookChatLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.webhookChatLabel')).toHaveAttribute('readonly')

    expect(screen.getByLabelText('licensees.form.webhookChatbotLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.webhookChatbotLabel')).toHaveAttribute('readonly')

    expect(screen.getByLabelText('licensees.form.webhookChatbotTransferLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.webhookChatbotTransferLabel')).toHaveAttribute('readonly')

    expect(screen.getByLabelText('licensees.form.webhookWhatsappLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('licensees.form.webhookWhatsappLabel')).toHaveAttribute('readonly')
  })
})
