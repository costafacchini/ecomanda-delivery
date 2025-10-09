import LicenseeNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createLicensee } from '../../../../services/licensee'

jest.mock('../../../../services/licensee')

describe('<LicenseeNew />', () => {
  function mount() {
    render(
      <MemoryRouter>
        <LicenseeNew />
      </MemoryRouter>
    )
  }

  it('creates a new licensee when the backend returns success', async () => {
    mount()

    createLicensee.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(createLicensee).toHaveBeenCalledWith({
        name: '',
        email: '',
        phone: '',
        active: false,
        apiToken: '',
        licenseKind: 'demo',
        useChatbot: false,
        chatbotDefault: '',
        chatbotUrl: '',
        chatbotAuthorizationToken: '',
        messageOnResetChatbot: '',
        chatbotApiToken: '',
        whatsappDefault: '',
        whatsappToken: '',
        whatsappUrl: '',
        chatDefault: '',
        chatIdentifier: '',
        chatKey: '',
        chatUrl: '',
        awsId: '',
        awsSecret: '',
        bucketName: '',
        cartDefault: '',
        unidadeId: '',
        statusId: '',
        messageOnCloseChat: '',
        productFractional2Name: '',
        productFractional2Id: '',
        productFractional3Name: '',
        productFractional3Id: '',
        productFractionalSize3Name: '',
        productFractionalSize3Id: '',
        productFractionalSize4Name: '',
        productFractionalSize4Id: '',
        productFractionals: '',
        pedidos10_integration: '',
        pedidos10_integrator: '',
        document: '',
        kind: '',
        financial_player_fee: '0.00',
        holder_name: '',
        bank: '',
        branch_number: '',
        branch_check_digit: '',
        account_number: '',
        account_check_digit: '',
        holder_kind: '',
        holder_document: '',
        account_type: '',
        useSenderName: false,
      }),
    )
  })

  it('renders the errors when the backend returns error', async () => {
    mount()

    createLicensee.mockResolvedValue({ status: 422, data: { errors: [{ message: 'This is an error' }] } })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})
