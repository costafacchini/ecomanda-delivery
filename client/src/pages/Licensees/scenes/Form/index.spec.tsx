import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import LicenseeForm from './'
import { setLicenseeWebhook } from '../../../../services/licensee'

vi.mock('../../../../services/licensee')

describe('<LicenseeForm />', () => {
  const onSubmit = vi.fn()

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
    // chatbotDefault must be non-empty for chatbot sub-fields to render
    // whatsappDefault must be non-empty for whatsapp token/url fields to render
    mount({ initialValues: { chatbotDefault: 'landbot', whatsappDefault: 'utalk' } })

    expect(screen.getByLabelText(/^Nome/)).toHaveValue('')
    expect(screen.getByLabelText(/^Tipo/)).toHaveValue('')
    expect(screen.getByLabelText(/^Documento/)).toHaveValue('')
    expect(screen.getByLabelText(/^E-mail/)).toHaveValue('')
    expect(screen.getByLabelText(/^Licença/)).toHaveValue('demo')
    expect(screen.getByLabelText(/^Telefone/)).toHaveValue('')
    expect(screen.getByLabelText('API token')).toHaveValue('')
    expect(screen.getByLabelText('Ativo')).not.toBeChecked()
    expect(screen.getByLabelText('Chatbot padrão')).toHaveValue('landbot')
    expect(screen.getByLabelText('URL do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Token do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toHaveValue('')
    expect(screen.getByLabelText('Mensagem de encerramento de chat')).toHaveValue('')
    expect(screen.getByLabelText(/^Chat padrão/)).toHaveValue('')
    expect(screen.getByLabelText(/^WhatsApp padrão/)).toHaveValue('utalk')
    expect(screen.getByLabelText(/^Token do WhatsApp/)).toHaveValue('')
    expect(screen.getByLabelText(/^URL do WhatsApp/)).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de Chat')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toHaveValue('')
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de WhatsApp')).toHaveValue('')
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
      urlChatWebhook: 'URL para webhook de Chat',
      urlChatbotWebhook: 'URL para webhook de Chatbot',
      urlChatbotTransfer: 'URL de webhook para transferir do Chatbot para o Chat',
      urlWhatsappWebhook: 'URL para webhook de whatsapp',
      document: '3692836715156',
      kind: 'company',
      useSenderName: true,
    }

    mount({ initialValues: licensee })

    expect(screen.getByLabelText(/^Nome/)).toHaveValue('Name')
    expect(screen.getByLabelText('Ativo')).toBeChecked()
    expect(screen.getByLabelText(/^Tipo/)).toHaveValue('company')
    expect(screen.getByLabelText(/^Documento/)).toHaveValue('3692836715156')
    expect(screen.getByLabelText(/^E-mail/)).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText(/^Telefone/)).toHaveValue('48999999215')
    expect(screen.getByLabelText('API token')).toHaveValue('token')
    expect(screen.getByLabelText(/^Licença/)).toHaveValue('paid')
    expect(screen.getByLabelText('Usa o remetente no nome do chat?')).toBeChecked()
    expect(screen.getByLabelText('Chatbot padrão')).toHaveValue('landbot')
    expect(screen.getByLabelText(/^WhatsApp padrão/)).toHaveValue('utalk')
    expect(screen.getByLabelText('URL do chatbot')).toHaveValue('URL chatbot')
    expect(screen.getByLabelText('Token do chatbot')).toHaveValue('token chatbot')
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toHaveValue('token api chatbot')
    expect(screen.getByLabelText('Mensagem de encerramento de chatbot abandonado')).toHaveValue('message')
    expect(screen.getByLabelText('Mensagem de encerramento de chat')).toHaveValue('on chat')
    expect(screen.getByLabelText(/^Token do WhatsApp/)).toHaveValue('token whats')
    expect(screen.getByLabelText(/^URL do WhatsApp/)).toHaveValue('URL do whats')
    expect(screen.getByLabelText(/^Chat padrão/)).toHaveValue('crisp')
    expect(screen.getByDisplayValue('URL do chat')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Identifier/)).toHaveValue('identifier')
    expect(screen.getByLabelText(/^Key/)).toHaveValue('key')
    expect(screen.getByLabelText('URL para webhook de Chat')).toHaveValue('URL para webhook de Chat')
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toHaveValue('URL para webhook de Chatbot')
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toHaveValue('URL de webhook para transferir do Chatbot para o Chat')
    expect(screen.getByLabelText('URL para webhook de WhatsApp')).toHaveValue('URL para webhook de whatsapp')
  })

  describe('fields', () => {
    it('always shows the ChatBot tab nav item regardless of useChatbot in initialValues', () => {
      mount({ initialValues: { useChatbot: false } })

      expect(screen.getByRole('button', { name: 'ChatBot' })).toBeInTheDocument()
    })

    it('always shows the Chat tab nav item regardless of chatDefault', () => {
      mount({ initialValues: { chatDefault: '' } })

      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument()
    })

    it('disables whatsapp fields if "Whatsapp padrão" is blank', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.getByLabelText(/^Token do WhatsApp/)).toBeEnabled()
      expect(screen.getByLabelText(/^URL do WhatsApp/)).toBeEnabled()

      cleanup()
      mount({ initialValues: { whatsappDefault: '' } })

      // fields are not rendered at all when whatsappDefault is blank
      expect(screen.queryByLabelText(/^Token do WhatsApp/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^URL do WhatsApp/)).not.toBeInTheDocument()
    })

    it('shows key and identifier fields if "Chat padrão" is crisp', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByLabelText(/^Identifier/)).toBeVisible()
      expect(screen.getByLabelText(/^Key/)).toBeEnabled()

      cleanup()
      mount({ initialValues: { chatDefault: 'rocketchat' } })

      expect(screen.queryByLabelText(/^Identifier/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^Key/)).not.toBeInTheDocument()
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
  })

  describe('tabs', () => {
    it('shows Principal, Chat, ChatBot and WhatsApp tab nav items', () => {
      mount()

      expect(screen.getByRole('button', { name: 'Principal' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'ChatBot' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'WhatsApp' })).toBeInTheDocument()
    })

    it('marks the Principal tab nav button as active on initial render', () => {
      mount()

      expect(screen.getByRole('button', { name: 'Principal' })).toHaveClass('active')
    })

    it('shows the Chat tab nav item when chatDefault is set', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument()
    })

    it('shows the ChatBot tab nav item when useChatbot is true', () => {
      mount({ initialValues: { useChatbot: true } })

      expect(screen.getByRole('button', { name: 'ChatBot' })).toBeInTheDocument()
    })

    it('shows the WhatsApp tab nav item when whatsappDefault is set', () => {
      mount({ initialValues: { whatsappDefault: 'utalk' } })

      expect(screen.getByRole('button', { name: 'WhatsApp' })).toBeInTheDocument()
    })

    it('clicking a tab nav button marks it as active and removes active from Principal', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      const chatTab = screen.getByRole('button', { name: 'Chat' })
      expect(chatTab).not.toHaveClass('active')

      fireEvent.click(chatTab)

      expect(chatTab).toHaveClass('active')
      expect(screen.getByRole('button', { name: 'Principal' })).not.toHaveClass('active')
    })

    it('clicking Principal tab after another tab makes Principal active again', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
      expect(screen.getByRole('button', { name: 'Chat' })).toHaveClass('active')

      fireEvent.click(screen.getByRole('button', { name: 'Principal' }))
      expect(screen.getByRole('button', { name: 'Principal' })).toHaveClass('active')
      expect(screen.getByRole('button', { name: 'Chat' })).not.toHaveClass('active')
    })

    it('all tab panes are present in the DOM regardless of which tab is active', () => {
      mount()

      const tabPanes = document.querySelectorAll('.tab-pane')
      expect(tabPanes).toHaveLength(4)
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
        useFileIDYcloud: false,
        useSectors: false,
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
        messageOnCloseChat: '',
        document: '',
        kind: '',
        useSenderName: false,
      })
    })
  })
})
