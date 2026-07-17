import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingModal from './OnboardingModal'
import { createAccount } from '../../services/onboarding'

vi.mock('../../services/onboarding')

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      // Interpolate {{status}} for the error key
      if (opts && typeof opts.status !== 'undefined') return `${k}:${opts.status}`
      return k
    },
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

// LanguageSwitcher uses useTranslation internally — mock it to render PT/EN buttons
vi.mock('../../components/LanguageSwitcher', () => ({
  LanguageSwitcher: ({ className }: { className?: string }) => (
    <div data-testid='language-switcher' className={className}>
      <button type='button' onClick={() => {}}>PT</button>
      <button type='button' onClick={() => {}}>EN</button>
    </div>
  ),
}))

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
    // Step 1: identity — fill required fields using translation keys (t(k) => k in tests)
    fireEvent.change(screen.getByLabelText('onboarding.identity.companyNameLabel'), { target: { value: 'Acme Corp' } })
    fireEvent.change(screen.getByLabelText('onboarding.identity.kindLabel'), { target: { value: 'company' } })
    fireEvent.change(screen.getByLabelText('onboarding.identity.documentLabel'), { target: { value: '12345678000195' } })
    fireEvent.change(screen.getByLabelText('onboarding.identity.phoneLabel'), { target: { value: '11999990000' } })
    fireEvent.change(screen.getByLabelText('onboarding.identity.licenseeEmailLabel'), { target: { value: 'acme@acme.com' } })
    fireEvent.click(screen.getByText('onboarding.buttons.next'))

    // Step 2: integrations — choose no chat, yes whatsapp
    await screen.findByText('onboarding.integrations.whatsappGateLabel')
    const yesButtons = screen.getAllByText('onboarding.yesNo.yes')
    const noButtons  = screen.getAllByText('onboarding.yesNo.no')
    fireEvent.click(noButtons[0])   // no chat
    fireEvent.click(yesButtons[1])  // yes whatsapp
    fireEvent.click(screen.getByText('onboarding.buttons.next'))

    await screen.findByText('onboarding.whatsapp.whatsappDefaultLabel')
  }

  describe('useDepartments checkbox', () => {
    it('does not show useDepartments checkbox when baileys is not selected', async () => {
      mount()
      await navigateToWhatsappStep()

      fireEvent.change(screen.getByLabelText('onboarding.whatsapp.whatsappDefaultLabel'), { target: { value: 'utalk' } })

      expect(screen.queryByLabelText(/onboarding\.whatsapp\.useDepartmentsLabel/)).not.toBeInTheDocument()
    })

    it('shows useDepartments checkbox when baileys is selected', async () => {
      mount()
      await navigateToWhatsappStep()

      fireEvent.change(screen.getByLabelText('onboarding.whatsapp.whatsappDefaultLabel'), { target: { value: 'baileys' } })

      expect(await screen.findByLabelText(/onboarding\.whatsapp\.useDepartmentsLabel/)).toBeInTheDocument()
    })
  })

  describe('onboarding payload', () => {
    it('includes useDepartments in the whatsapp submission payload', async () => {
      ;(createAccount as any).mockResolvedValue({ status: 201 })

      mount()
      await navigateToWhatsappStep()

      // Select baileys
      fireEvent.change(screen.getByLabelText('onboarding.whatsapp.whatsappDefaultLabel'), { target: { value: 'baileys' } })

      // Check useDepartments
      const checkbox = await screen.findByLabelText(/onboarding\.whatsapp\.useDepartmentsLabel/)
      fireEvent.click(checkbox)

      // Navigate to user step
      fireEvent.click(screen.getByText('onboarding.buttons.next'))

      await screen.findByText('onboarding.user.userNameLabel')
      fireEvent.change(screen.getByLabelText('onboarding.user.userNameLabel'), { target: { value: 'John Doe' } })
      fireEvent.change(screen.getByLabelText('onboarding.user.userEmailLabel'), { target: { value: 'john@acme.com' } })
      fireEvent.change(screen.getByLabelText('onboarding.user.passwordLabel'), { target: { value: 'senha123' } })
      fireEvent.change(screen.getByLabelText('onboarding.user.confirmPasswordLabel'), { target: { value: 'senha123' } })

      fireEvent.click(screen.getByRole('button', { name: 'onboarding.buttons.submit' }))

      await waitFor(() =>
        expect(createAccount).toHaveBeenCalledWith(
          expect.objectContaining({ useDepartments: true })
        )
      )
    })

    it('includes language in the submission payload', async () => {
      ;(createAccount as any).mockResolvedValue({ status: 201 })

      mount()
      await navigateToWhatsappStep()

      fireEvent.change(screen.getByLabelText('onboarding.whatsapp.whatsappDefaultLabel'), { target: { value: 'baileys' } })

      fireEvent.click(screen.getByText('onboarding.buttons.next'))

      await screen.findByText('onboarding.user.userNameLabel')
      fireEvent.change(screen.getByLabelText('onboarding.user.userNameLabel'), { target: { value: 'John Doe' } })
      fireEvent.change(screen.getByLabelText('onboarding.user.userEmailLabel'), { target: { value: 'john@acme.com' } })
      fireEvent.change(screen.getByLabelText('onboarding.user.passwordLabel'), { target: { value: 'senha123' } })
      fireEvent.change(screen.getByLabelText('onboarding.user.confirmPasswordLabel'), { target: { value: 'senha123' } })

      fireEvent.click(screen.getByRole('button', { name: 'onboarding.buttons.submit' }))

      await waitFor(() =>
        expect(createAccount).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'pt' })
        )
      )
    })
  })

  describe('LanguageSwitcher', () => {
    it('renders the language switcher in the modal header', () => {
      mount()
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    })
  })
})
