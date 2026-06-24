import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import LicenseeForm from './'
import { setLicenseeWebhook } from '../../../../services/licensee'

vi.mock('../../../../services/licensee')

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

    expect(screen.getByLabelText(/^licensees\.form\.nameLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.kindLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.documentLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.emailLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.licenseKindLabel/)).toHaveValue('demo')
    expect(screen.getByLabelText(/^licensees\.form\.phoneLabel/)).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.apiTokenLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.activeLabel')).not.toBeChecked()
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotDefaultLabel')).toHaveValue('landbot')
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotUrlLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotTokenLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotApiTokenLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.chatbot.messageOnResetLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.chatbot.messageOnCloseLabel')).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.chat\.chatDefaultLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappDefaultLabel/)).toHaveValue('utalk')
    expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappTokenLabel/)).toHaveValue('')
    expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappUrlLabel/)).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.webhookChatLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.webhookChatbotLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.webhookChatbotTransferLabel')).toHaveValue('')
    expect(screen.getByLabelText('licensees.form.webhookWhatsappLabel')).toHaveValue('')
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

    expect(screen.getByLabelText(/^licensees\.form\.nameLabel/)).toHaveValue('Name')
    expect(screen.getByLabelText('licensees.form.activeLabel')).toBeChecked()
    expect(screen.getByLabelText(/^licensees\.form\.kindLabel/)).toHaveValue('company')
    expect(screen.getByLabelText(/^licensees\.form\.documentLabel/)).toHaveValue('3692836715156')
    expect(screen.getByLabelText(/^licensees\.form\.emailLabel/)).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText(/^licensees\.form\.phoneLabel/)).toHaveValue('48999999215')
    expect(screen.getByLabelText('licensees.form.apiTokenLabel')).toHaveValue('token')
    expect(screen.getByLabelText(/^licensees\.form\.licenseKindLabel/)).toHaveValue('paid')
    expect(screen.getByLabelText('licensees.form.chat.useSenderNameLabel')).toBeChecked()
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotDefaultLabel')).toHaveValue('landbot')
    expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappDefaultLabel/)).toHaveValue('utalk')
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotUrlLabel')).toHaveValue('URL chatbot')
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotTokenLabel')).toHaveValue('token chatbot')
    expect(screen.getByLabelText('licensees.form.chatbot.chatbotApiTokenLabel')).toHaveValue('token api chatbot')
    expect(screen.getByLabelText('licensees.form.chatbot.messageOnResetLabel')).toHaveValue('message')
    expect(screen.getByLabelText('licensees.form.chatbot.messageOnCloseLabel')).toHaveValue('on chat')
    expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappTokenLabel/)).toHaveValue('token whats')
    expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappUrlLabel/)).toHaveValue('URL do whats')
    expect(screen.getByLabelText(/^licensees\.form\.chat\.chatDefaultLabel/)).toHaveValue('crisp')
    expect(screen.getByDisplayValue('URL do chat')).toBeInTheDocument()
    expect(screen.getByLabelText(/^licensees\.form\.chat\.identifierLabel/)).toHaveValue('identifier')
    expect(screen.getByLabelText(/^licensees\.form\.chat\.keyLabel/)).toHaveValue('key')
    expect(screen.getByLabelText('licensees.form.webhookChatLabel')).toHaveValue('URL para webhook de Chat')
    expect(screen.getByLabelText('licensees.form.webhookChatbotLabel')).toHaveValue('URL para webhook de Chatbot')
    expect(screen.getByLabelText('licensees.form.webhookChatbotTransferLabel')).toHaveValue('URL de webhook para transferir do Chatbot para o Chat')
    expect(screen.getByLabelText('licensees.form.webhookWhatsappLabel')).toHaveValue('URL para webhook de whatsapp')
  })

  describe('fields', () => {
    it('always shows the ChatBot tab nav item regardless of useChatbot in initialValues', () => {
      mount({ initialValues: { useChatbot: false } })

      expect(screen.getByRole('button', { name: 'licensees.form.tabChatBot' })).toBeInTheDocument()
    })

    it('always shows the Chat tab nav item regardless of chatDefault', () => {
      mount({ initialValues: { chatDefault: '' } })

      expect(screen.getByRole('button', { name: 'licensees.form.tabChat' })).toBeInTheDocument()
    })

    it('disables whatsapp fields if "Whatsapp padrão" is blank', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappTokenLabel/)).toBeEnabled()
      expect(screen.getByLabelText(/^licensees\.form\.whatsapp\.whatsappUrlLabel/)).toBeEnabled()

      cleanup()
      mount({ initialValues: { whatsappDefault: '' } })

      // fields are not rendered at all when whatsappDefault is blank
      expect(screen.queryByLabelText(/^licensees\.form\.whatsapp\.whatsappTokenLabel/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^licensees\.form\.whatsapp\.whatsappUrlLabel/)).not.toBeInTheDocument()
    })

    it('shows key and identifier fields if "Chat padrão" is crisp', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByLabelText(/^licensees\.form\.chat\.identifierLabel/)).toBeVisible()
      expect(screen.getByLabelText(/^licensees\.form\.chat\.keyLabel/)).toBeEnabled()

      cleanup()
      mount({ initialValues: { chatDefault: 'rocketchat' } })

      expect(screen.queryByLabelText(/^licensees\.form\.chat\.identifierLabel/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^licensees\.form\.chat\.keyLabel/)).not.toBeInTheDocument()
    })

    it('shows button set webhook if "Whatsapp padrão" is dialog and licensee has apiToken', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.queryByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { apiToken: 'key' } })

      expect(screen.queryByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(screen.getByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' })).toBeInTheDocument()
    })

    it('shows button set webhook if "Whatsapp padrão" is YCloud and licensee has apiToken', () => {
      mount({ initialValues: { whatsappDefault: 'ycloud' } })

      expect(screen.queryByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { apiToken: 'key' } })

      expect(screen.queryByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(screen.getByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' })).toBeInTheDocument()
    })

    it('Configurar Webhook no provedor click', () => {
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(setLicenseeWebhook).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'licensees.form.whatsapp.setWebhookButton' }))

      expect(setLicenseeWebhook).toHaveBeenCalledTimes(1)
    })
  })

  describe('tabs', () => {
    it('shows Principal, Chat, ChatBot and WhatsApp tab nav items', () => {
      mount()

      expect(screen.getByRole('button', { name: 'licensees.form.tabPrincipal' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'licensees.form.tabChat' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'licensees.form.tabChatBot' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'licensees.form.tabWhatsApp' })).toBeInTheDocument()
    })

    it('marks the Principal tab nav button as active on initial render', () => {
      mount()

      expect(screen.getByRole('button', { name: 'licensees.form.tabPrincipal' })).toHaveClass('active')
    })

    it('shows the Chat tab nav item when chatDefault is set', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByRole('button', { name: 'licensees.form.tabChat' })).toBeInTheDocument()
    })

    it('shows the ChatBot tab nav item when useChatbot is true', () => {
      mount({ initialValues: { useChatbot: true } })

      expect(screen.getByRole('button', { name: 'licensees.form.tabChatBot' })).toBeInTheDocument()
    })

    it('shows the WhatsApp tab nav item when whatsappDefault is set', () => {
      mount({ initialValues: { whatsappDefault: 'utalk' } })

      expect(screen.getByRole('button', { name: 'licensees.form.tabWhatsApp' })).toBeInTheDocument()
    })

    it('clicking a tab nav button marks it as active and removes active from Principal', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      const chatTab = screen.getByRole('button', { name: 'licensees.form.tabChat' })
      expect(chatTab).not.toHaveClass('active')

      fireEvent.click(chatTab)

      expect(chatTab).toHaveClass('active')
      expect(screen.getByRole('button', { name: 'licensees.form.tabPrincipal' })).not.toHaveClass('active')
    })

    it('clicking Principal tab after another tab makes Principal active again', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      fireEvent.click(screen.getByRole('button', { name: 'licensees.form.tabChat' }))
      expect(screen.getByRole('button', { name: 'licensees.form.tabChat' })).toHaveClass('active')

      fireEvent.click(screen.getByRole('button', { name: 'licensees.form.tabPrincipal' }))
      expect(screen.getByRole('button', { name: 'licensees.form.tabPrincipal' })).toHaveClass('active')
      expect(screen.getByRole('button', { name: 'licensees.form.tabChat' })).not.toHaveClass('active')
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

      fireEvent.click(screen.getByText('common.save'))

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
