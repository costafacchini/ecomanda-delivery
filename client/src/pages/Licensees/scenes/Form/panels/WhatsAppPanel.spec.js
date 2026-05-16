import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import WhatsAppPanel from './WhatsAppPanel'

vi.mock('../../../../../services/licensee', () => ({
  setLicenseeWebhook: vi.fn(),
  getBaileysQr: vi.fn(),
  getBaileysStatus: vi.fn(),
  importLicenseeTemplate: vi.fn(),
  syncBaileysDirectory: vi.fn(),
}))

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }) => <div data-testid="qr-code">{value}</div>,
}))

import { getBaileysQr, getBaileysStatus, syncBaileysDirectory } from '../../../../../services/licensee'

const noop = () => {}

const defaultValues = {
  whatsappDefault: '',
  whatsappToken: '',
  whatsappUrl: '',
  useFileIDYcloud: false,
  apiToken: '',
}

function mount(overrides = {}, panelProps = {}) {
  const values = { ...defaultValues, ...overrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <WhatsAppPanel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
        {...panelProps}
      />
    </Formik>
  )
}

describe('<WhatsAppPanel />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders whatsappDefault select', () => {
    mount()

    expect(screen.getByLabelText('Whatsapp padrão')).toBeInTheDocument()
  })

  it('shows whatsappToken and whatsappUrl fields when whatsappDefault is utalk', () => {
    mount({ whatsappDefault: 'utalk' })

    expect(screen.getByLabelText('Token do whatsapp')).toBeInTheDocument()
    expect(screen.getByLabelText('Url do whatsapp')).toBeInTheDocument()
  })

  it('does NOT show whatsappToken/whatsappUrl when whatsappDefault is baileys', () => {
    mount({ whatsappDefault: 'baileys' })

    expect(screen.queryByLabelText('Token do whatsapp')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Url do whatsapp')).not.toBeInTheDocument()
  })

  it('shows useFileIDYcloud checkbox only when whatsappDefault is ycloud', () => {
    mount({ whatsappDefault: 'ycloud' })

    expect(screen.getByLabelText('Usar ID no YCloud ao invés de URL?')).toBeInTheDocument()
  })

  it('does NOT show useFileIDYcloud when whatsappDefault is utalk', () => {
    mount({ whatsappDefault: 'utalk' })

    expect(screen.queryByLabelText('Usar ID no YCloud ao invés de URL?')).not.toBeInTheDocument()
  })

  it('shows "Gerar QR Code" button when whatsappDefault is baileys', () => {
    mount({ whatsappDefault: 'baileys' })

    expect(screen.getByRole('button', { name: 'Gerar QR Code' })).toBeInTheDocument()
  })

  it('does NOT show "Gerar QR Code" when whatsappDefault is utalk', () => {
    mount({ whatsappDefault: 'utalk' })

    expect(screen.queryByRole('button', { name: 'Gerar QR Code' })).not.toBeInTheDocument()
  })

  it('shows "Configurar Webhook no provedor" button when whatsappDefault is dialog AND apiToken is set', () => {
    mount({ whatsappDefault: 'dialog', apiToken: 'my-token' })

    expect(screen.getByRole('button', { name: 'Configurar Webhook no provedor' })).toBeInTheDocument()
  })

  it('does NOT show "Configurar Webhook no provedor" when apiToken is empty', () => {
    mount({ whatsappDefault: 'dialog', apiToken: '' })

    expect(screen.queryByRole('button', { name: 'Configurar Webhook no provedor' })).not.toBeInTheDocument()
  })

  it('shows QR code after clicking "Gerar QR Code" when service returns qr data', async () => {
    getBaileysQr.mockResolvedValue({ data: { qr: 'abc123' } })
    mount({ whatsappDefault: 'baileys' })

    fireEvent.click(screen.getByRole('button', { name: 'Gerar QR Code' }))

    await waitFor(() => {
      expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      expect(screen.getByTestId('qr-code')).toHaveTextContent('abc123')
    })
  })

  it('shows status message after clicking "Gerar QR Code" when service returns message', async () => {
    getBaileysQr.mockResolvedValue({ data: { message: 'Sessão ativa' } })
    mount({ whatsappDefault: 'baileys' })

    fireEvent.click(screen.getByRole('button', { name: 'Gerar QR Code' }))

    await waitFor(() => {
      expect(screen.getByText('Sessão ativa')).toBeInTheDocument()
    })
  })

  describe('Sync Groups button', () => {
    it('shows "Sincronizar Grupos" button when Baileys is connected and licensee is persisted', async () => {
      getBaileysStatus.mockResolvedValue({ data: { connected: true } })
      mount({ whatsappDefault: 'baileys', id: 'abc123' }, { isActive: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sincronizar Grupos' })).toBeInTheDocument()
      })
    })

    it('does NOT show "Sincronizar Grupos" when licensee is not persisted', async () => {
      getBaileysStatus.mockResolvedValue({ data: { connected: true } })
      mount({ whatsappDefault: 'baileys' }, { isActive: true })

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Sincronizar Grupos' })).not.toBeInTheDocument()
      })
    })

    it('displays sync counts after successful sync', async () => {
      getBaileysStatus.mockResolvedValue({ data: { connected: true } })
      syncBaileysDirectory.mockResolvedValue({ data: { importedGroups: 3, updatedGroups: 1 } })
      mount({ whatsappDefault: 'baileys', id: 'abc123' }, { isActive: true })

      fireEvent.click(await screen.findByRole('button', { name: 'Sincronizar Grupos' }))

      await waitFor(() => {
        expect(screen.getByText(/Grupos importados: 3/)).toBeInTheDocument()
        expect(screen.getByText(/Grupos atualizados: 1/)).toBeInTheDocument()
      })
    })

    it('displays error message when sync fails', async () => {
      getBaileysStatus.mockResolvedValue({ data: { connected: true } })
      syncBaileysDirectory.mockRejectedValue(new Error('Network error'))
      mount({ whatsappDefault: 'baileys', id: 'abc123' }, { isActive: true })

      fireEvent.click(await screen.findByRole('button', { name: 'Sincronizar Grupos' }))

      await waitFor(() => {
        expect(screen.getByText('Erro ao sincronizar grupos')).toBeInTheDocument()
      })
    })
  })
})
