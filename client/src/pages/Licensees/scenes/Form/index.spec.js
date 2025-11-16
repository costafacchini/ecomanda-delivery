import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import LicenseeForm from './'
import { setLicenseeWebhook, signOrderWebhook } from '../../../../services/licensee'

jest.mock('../../../../services/licensee')

describe('<LicenseeForm />', () => {
  const onSubmit = jest.fn()

  function mount(props = {}) {
    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => <LicenseeForm onSubmit={onSubmit} {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Tipo')).toHaveValue('')
    expect(screen.getByLabelText('Documento')).toHaveValue('')
    expect(screen.getByLabelText('E-email')).toHaveValue('')
    expect(screen.getByLabelText('Licença')).toHaveValue('demo')
    expect(screen.getByLabelText('Telefone')).toHaveValue('')
    expect(screen.getByLabelText('API token')).toHaveValue('')
    expect(screen.getByLabelText('Ativo')).not.toBeChecked()
    expect(screen.getByLabelText('Usa chatbot?')).not.toBeChecked()
    expect(screen.getByLabelText('Usa o remetente no nome do chat?')).not.toBeChecked()
    expect(screen.getByLabelText('Chatbot padrão')).toHaveValue('')
    expect(screen.getByLabelText('URL do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Token do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toHaveValue('')
    expect(screen.getByLabelText('Mensagem de encerramento de chat')).toHaveValue('')
    expect(screen.getByLabelText('Chat padrão')).toHaveValue('')
    expect(screen.getByLabelText('Url do chat')).toHaveValue('')
    expect(screen.getByLabelText('Whatsapp padrão')).toHaveValue('')
    expect(screen.getByLabelText('Token do whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('Url do whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('Id da AWS')).toHaveValue('')
    expect(screen.getByLabelText('Senha AWS')).toHaveValue('')
    expect(screen.getByLabelText('Nome do bucket AWS')).toHaveValue('')
    expect(screen.getByLabelText('Plugin para uso de carrinho de compra')).toHaveValue('')
    expect(screen.getByLabelText('Id da loja')).toHaveValue('')
    expect(screen.getByLabelText('Id do status do carrinho de compra')).toHaveValue('')
    expect(screen.getByLabelText('Produtos')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de Chat')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toHaveValue('')
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('% Taxa')).toHaveValue(0)
    expect(screen.getByLabelText('Nome do titular da conta')).toHaveValue('')
    expect(screen.getByLabelText('Tipo titular da conta')).toHaveValue('')
    expect(screen.getByLabelText('Documento titular da conta')).toHaveValue('')
    expect(screen.getByLabelText('Banco')).toHaveValue('')
    expect(screen.getByLabelText('AG')).toHaveValue('')
    expect(screen.getAllByLabelText('DG')[0]).toHaveValue('')
    expect(screen.getByLabelText('Conta')).toHaveValue('')
    expect(screen.getAllByLabelText('DG')[1]).toHaveValue('')
    expect(screen.getByLabelText('Tipo da conta')).toHaveValue('')
  })

  it('can receive initial values', () => {
    const licensee = {
      name: 'Name',
      active: true,
      email: 'email@gmail.com',
      phone: '48999999215',
      apiToken: 'token',
      licenseKind: 'paid',
      useChatbot: true,
      chatbotDefault: 'landbot',
      chatbotUrl: 'URL chatbot',
      chatbotAuthorizationToken: 'token chatbot',
      messageOnResetChatbot: 'message',
      messageOnCloseChat: 'on chat',
      chatbotApiToken: 'token api chatbot',
      whatsappDefault: 'utalk',
      whatsappToken: 'token whats',
      whatsappUrl: 'URL do whats',
      chatDefault: 'crisp',
      chatUrl: 'URL do chat',
      chatKey: 'key',
      chatIdentifier: 'identifier',
      awsId: 'ID da AWS',
      awsSecret: 'Senha da AWS',
      bucketName: 'Nome do bucket',
      cartDefault: 'go2go',
      unidadeId: '999',
      statusId: '5433',
      productFractionals: 'Fractionals',
      urlChatWebhook: 'URL para webhook de Chat',
      urlChatbotWebhook: 'URL para webhook de Chatbot',
      urlChatbotTransfer: 'URL de webhook para transferir do Chatbot para o Chat',
      urlWhatsappWebhook: 'URL para webhook de whatsapp',
      document: '3692836715156',
      kind: 'company',
      financial_player_fee: '2.30',
      holder_name: 'John Doe',
      bank: '001',
      branch_number: '123',
      branch_check_digit: '1',
      account_number: '8463',
      account_check_digit: '2',
      holder_kind: 'company',
      holder_document: '0987517651712',
      account_type: 'savings',
      useSenderName: true,
    }

    mount({ initialValues: licensee })

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('Ativo')).toBeChecked()
    expect(screen.getByLabelText('Tipo')).toHaveValue('company')
    expect(screen.getByLabelText('Documento')).toHaveValue('3692836715156')
    expect(screen.getByLabelText('E-email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText('Telefone')).toHaveValue('48999999215')
    expect(screen.getByLabelText('API token')).toHaveValue('token')
    expect(screen.getByLabelText('Licença')).toHaveValue('paid')
    expect(screen.getByLabelText('Usa chatbot?')).toBeChecked()
    expect(screen.getByLabelText('Usa o remetente no nome do chat?')).toBeChecked()
    expect(screen.getByLabelText('Chatbot padrão')).toHaveValue('landbot')
    expect(screen.getByLabelText('Whatsapp padrão')).toHaveValue('utalk')
    expect(screen.getByLabelText('URL do chatbot')).toHaveValue('URL chatbot')
    expect(screen.getByLabelText('Token do chatbot')).toHaveValue('token chatbot')
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toHaveValue('token api chatbot')
    expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toHaveValue('message')
    expect(screen.getByLabelText('Mensagem de encerramento de chat')).toHaveValue('on chat')
    expect(screen.getByLabelText('Token do whatsapp')).toHaveValue('token whats')
    expect(screen.getByLabelText('Url do whatsapp')).toHaveValue('URL do whats')
    expect(screen.getByLabelText('Chat padrão')).toHaveValue('crisp')
    expect(screen.getByLabelText('Url do chat')).toHaveValue('URL do chat')
    expect(screen.getByLabelText('Identifier')).toHaveValue('identifier')
    expect(screen.getByLabelText('Key')).toHaveValue('key')
    expect(screen.getByLabelText('Id da AWS')).toHaveValue('ID da AWS')
    expect(screen.getByLabelText('Senha AWS')).toHaveValue('Senha da AWS')
    expect(screen.getByLabelText('Nome do bucket AWS')).toHaveValue('Nome do bucket')
    expect(screen.getByLabelText('Plugin para uso de carrinho de compra')).toHaveValue('go2go')
    expect(screen.getByLabelText('Id da loja')).toHaveValue('999')
    expect(screen.getByLabelText('Id do status do carrinho de compra')).toHaveValue('5433')
    expect(screen.getByLabelText('Produtos')).toHaveValue('Fractionals')
    expect(screen.getByLabelText('URL para webhook de Chat')).toHaveValue('URL para webhook de Chat')
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toHaveValue('URL para webhook de Chatbot')
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toHaveValue('URL de webhook para transferir do Chatbot para o Chat')
    expect(screen.getByLabelText('URL para webhook de whatsapp')).toHaveValue('URL para webhook de whatsapp')
    expect(screen.getByLabelText('% Taxa')).toHaveValue(2.3)
    expect(screen.getByLabelText('Nome do titular da conta')).toHaveValue('John Doe')
    expect(screen.getByLabelText('Tipo titular da conta')).toHaveValue('company')
    expect(screen.getByLabelText('Documento titular da conta')).toHaveValue('0987517651712')
    expect(screen.getByLabelText('Banco')).toHaveValue('001')
    expect(screen.getByLabelText('AG')).toHaveValue('123')
    expect(screen.getAllByLabelText('DG')[0]).toHaveValue('1')
    expect(screen.getByLabelText('Conta')).toHaveValue('8463')
    expect(screen.getAllByLabelText('DG')[1]).toHaveValue('2')
    expect(screen.getByLabelText('Tipo da conta')).toHaveValue('savings')
  })

  describe('fields', () => {
    it('disables chatbot fields if "Usa chatbot?" is false', () => {
      mount({ initialValues: { useChatbot: true } })

      expect(screen.getByLabelText('Usa chatbot?')).toBeChecked()
      expect(screen.getByLabelText('Chatbot padrão')).toBeEnabled()
      expect(screen.getByLabelText('URL do chatbot')).toBeEnabled()
      expect(screen.getByLabelText('Token do chatbot')).toBeEnabled()
      expect(screen.getByLabelText('Token de acesso via API do chatbot')).toBeEnabled()
      expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toBeEnabled()

      cleanup()
      mount({ initialValues: { useChatbot: false } })

      expect(screen.getByLabelText('Usa chatbot?')).not.toBeChecked()
      expect(screen.getByLabelText('Chatbot padrão')).toBeDisabled()
      expect(screen.getByLabelText('URL do chatbot')).toBeDisabled()
      expect(screen.getByLabelText('Token do chatbot')).toBeDisabled()
      expect(screen.getByLabelText('Token de acesso via API do chatbot')).toBeDisabled()
      expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toBeDisabled()
    })

    it('disables chat fields if "Chat padrão" is blank', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByLabelText('Url do chat')).toBeEnabled()
      expect(screen.getByLabelText('Identifier')).toBeEnabled()
      expect(screen.getByLabelText('Key')).toBeEnabled()

      cleanup()
      mount({ initialValues: { chatDefault: '' } })

      expect(screen.getByLabelText('Url do chat')).toBeDisabled()
    })

    it('disables whatsapp fields if "Whatsapp padrão" is blank', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.getByLabelText('Token do whatsapp')).toBeEnabled()
      expect(screen.getByLabelText('Url do whatsapp')).toBeEnabled()

      cleanup()
      mount({ initialValues: { whatsappDefault: '' } })

      expect(screen.getByLabelText('Token do whatsapp')).toBeDisabled()
      expect(screen.getByLabelText('Url do whatsapp')).toBeDisabled()
    })

    it('shows key and identifier fields if "Chat padrão" is crisp', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByLabelText('Identifier')).toBeVisible()
      expect(screen.getByLabelText('Key')).toBeEnabled()

      cleanup()
      mount({ initialValues: { chatDefault: 'rocketchat' } })

      expect(screen.queryByLabelText('Identifier')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Key')).not.toBeInTheDocument()
    })

    it('shows button set webhook if "Whatsapp padrão" is dialog and licensee has apiToken', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.queryByRole('button', { name: 'Configurar Webhook no provedor' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { apiToken: 'key' } })

      expect(screen.queryByRole('button', { name: 'Configurar Webhook no provedor' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(screen.getByRole('button', { name: 'Configurar Webhook no provedor' })).toBeInTheDocument()
    })

    it('shows button set webhook if "Whatsapp padrão" is YCloud and licensee has apiToken', () => {
      mount({ initialValues: { whatsappDefault: 'ycloud' } })

      expect(screen.queryByRole('button', { name: 'Configurar Webhook no provedor' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { apiToken: 'key' } })

      expect(screen.queryByRole('button', { name: 'Configurar Webhook no provedor' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(screen.getByRole('button', { name: 'Configurar Webhook no provedor' })).toBeInTheDocument()
    })

    it('Configurar Webhook no provedor click', () => {
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(setLicenseeWebhook).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Configurar Webhook no provedor' }))

      expect(setLicenseeWebhook).toHaveBeenCalledTimes(1)
    })

    describe('Pedidos 10 fieldset', () => {
      it('show fiels when user isPedidos10', () => {
        mount({ currentUser: { } })

        expect(screen.queryByLabelText('Dados da integração')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Software Integrador')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Assinar Webhook P10' })).not.toBeInTheDocument()

        cleanup()
        mount({ currentUser: { isPedidos10: true } })

        expect(screen.getByLabelText('Dados da integração')).toBeVisible()
        expect(screen.getByLabelText('Software Integrador')).toBeVisible()
        expect(screen.getByRole('button', { name: 'Assinar Webhook P10' })).toBeInTheDocument()
      })

      it('Assinar Webhook P10 click', () => {
        mount({ currentUser: { isPedidos10: true } })

        expect(signOrderWebhook).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Assinar Webhook P10' }))

        expect(signOrderWebhook).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Salvar'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
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
      })
    })
  })
})
