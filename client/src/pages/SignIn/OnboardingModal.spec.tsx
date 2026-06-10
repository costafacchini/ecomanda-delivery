import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingModal from './OnboardingModal'
import { createAccount } from '../../services/onboarding'

vi.mock('../../services/onboarding')

describe('<OnboardingModal />', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }

  function mount(props: any = {}) {
    render(<OnboardingModal {...defaultProps} {...props} />)
  }

  async function navigateToWhatsappStep() {
    // Step 1: identity — fill required fields
    fireEvent.change(screen.getByLabelText('Nome da empresa'), { target: { value: 'Acme Corp' } })
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'company' } })
    fireEvent.change(screen.getByLabelText('Documento'), { target: { value: '12345678000195' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11999990000' } })
    fireEvent.change(screen.getByLabelText('E-mail da empresa'), { target: { value: 'acme@acme.com' } })
    fireEvent.click(screen.getByText('Próximo →'))

    // Step 2: integrations — choose no chat, yes whatsapp
    await screen.findByText('Deseja integrar com uma Plataforma de Chat?')
    // Two YesNoGate components: [chatSim, whatsappSim], [chatNao, whatsappNao]
    const simButtons = screen.getAllByText('Sim')
    const naoButtons = screen.getAllByText('Não')
    fireEvent.click(naoButtons[0])   // no chat
    fireEvent.click(simButtons[1])   // yes whatsapp
    fireEvent.click(screen.getByText('Próximo →'))

    await screen.findByText('WhatsApp padrão')
  }

  describe('useSectors checkbox', () => {
    it('does not show useSectors checkbox when baileys is not selected', async () => {
      mount()
      await navigateToWhatsappStep()

      fireEvent.change(screen.getByLabelText('WhatsApp padrão'), { target: { value: 'utalk' } })

      expect(screen.queryByLabelText(/Usar setores/)).not.toBeInTheDocument()
    })

    it('shows useSectors checkbox when baileys is selected', async () => {
      mount()
      await navigateToWhatsappStep()

      fireEvent.change(screen.getByLabelText('WhatsApp padrão'), { target: { value: 'baileys' } })

      expect(await screen.findByLabelText(/Usar setores/)).toBeInTheDocument()
    })
  })

  describe('onboarding payload', () => {
    it('includes useSectors in the whatsapp submission payload', async () => {
      ;(createAccount as any).mockResolvedValue({ status: 201 })

      mount()
      await navigateToWhatsappStep()

      // Select baileys
      fireEvent.change(screen.getByLabelText('WhatsApp padrão'), { target: { value: 'baileys' } })

      // Check useSectors
      const checkbox = await screen.findByLabelText(/Usar setores/)
      fireEvent.click(checkbox)

      // Navigate to user step
      fireEvent.click(screen.getByText('Próximo →'))

      await screen.findByText('Seu nome')
      fireEvent.change(screen.getByLabelText('Seu nome'), { target: { value: 'John Doe' } })
      fireEvent.change(screen.getByLabelText('Seu e-mail'), { target: { value: 'john@acme.com' } })
      fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } })
      fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha123' } })

      fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

      await waitFor(() =>
        expect(createAccount).toHaveBeenCalledWith(
          expect.objectContaining({ useSectors: true })
        )
      )
    })
  })
})
