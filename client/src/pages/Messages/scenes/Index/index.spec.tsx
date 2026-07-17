import MessageIndex from './'
import { fireEvent, screen, cleanup, render, waitFor } from '@testing-library/react'
import { getMessages, resendMessage } from '../../../../services/message'
import { createRoutesStub } from 'react-router'
import { getLicensees } from '../../../../services/licensee'
import { getContacts } from '../../../../services/contact'
import { messageFactory } from '../../../../factories/message'
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/message')
vi.mock('../../../../services/licensee')
vi.mock('../../../../services/contact')
vi.mock('moment-timezone', () => {
  const pad = (n: number) => String(n).padStart(2, '0')

  function fmt(date: Date, format: string): string {
    return format
      .replace('YYYY', String(date.getUTCFullYear()))
      .replace('MM', pad(date.getUTCMonth() + 1))
      .replace('DD', pad(date.getUTCDate()))
      .replace('HH', pad(date.getUTCHours()))
      .replace('mm', pad(date.getUTCMinutes()))
      .replace('ss', pad(date.getUTCSeconds()))
  }

  const chain = (date: Date) => ({
    tz: () => chain(date),
    utc: () => chain(date),
    format: (f?: string) => f ? fmt(date, f) : date.toISOString(),
    startOf: (unit?: string) => { const d = new Date(date); if (unit === 'day') d.setUTCHours(0, 0, 0, 0); return chain(d) },
    endOf: (unit?: string) => { const d = new Date(date); if (unit === 'day') d.setUTCHours(23, 59, 59, 999); return chain(d) },
    subtract: (n?: number, unit?: string) => { const d = new Date(date); if (unit === 'hours' && n) d.setUTCHours(d.getUTCHours() - n); return chain(d) },
    toISOString: () => date.toISOString(),
  })

  const parse = (val?: string) => val ? new Date(val.endsWith('Z') || val.includes('+') ? val : `${val}Z`) : new Date()
  const momentFn = (val?: string) => chain(parse(val))
  momentFn.tz = (val: string) => chain(parse(val))
  return { default: momentFn }
})
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<MessageIndex />', () => {
  const currentUser = { role: 'super' }
  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/messages',
        Component: () => (
          <AppContext.Provider value={appContextValue}>
            <MessageIndex currentUser={currentUser} />
          </AppContext.Provider>
        ),
      },
    ])
    render(<Stub initialEntries={['/messages']} />)
  }

  it('renders the messages when the user clicks on the search button', async () => {
    getMessages.mockResolvedValue(
      {
        status: 201,
        data: [
          {
            id: '1',
            contact: {
              name: 'Contact',
            },
            kind: 'text',
            text: 'First message',
            destination: 'to-chat',
            sended: true,
          }
        ]
      }
    )

    mount({ currentUser })

    fireEvent.click(screen.getByText('messages.searchButton'))

    expect(await screen.findByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getAllByText('messages.kindText').length).toBeGreaterThan(0)
    expect(screen.getAllByText('messages.destinationChat').length).toBeGreaterThan(0)
    expect(screen.getByText('messages.sentYes')).toBeInTheDocument()

    expect(getMessages).toHaveBeenCalledWith(
      expect.objectContaining({
        contact: "",
        destination: "",
        kind: "",
        licensee: "",
        onlyErrors: false,
        page: 1,
        startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      })
    )
  })

  describe('pagination', () => {
    it('paginates the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: messageFactory.buildList(30) })

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))
      expect(await screen.findByText('common.loadMore')).toBeInTheDocument()

      getMessages.mockResolvedValue({ status: 201, data: [messageFactory.build({ text: 'Message from new page' })] })
      fireEvent.click(await screen.findByText('common.loadMore'))

      expect(await screen.findByText('Message from new page')).toBeInTheDocument()

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    })
  })

  describe('startDate filter', () => {
    beforeEach(() => {
      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({ resolvedOptions: () => ({ timeZone: 'UTC' }) }))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('converts the local datetime to UTC before querying', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ id: '1', contact: { name: 'Contact' } }] })

      mount({ currentUser })

      fireEvent.change(screen.getByLabelText('messages.startDateLabel'), { target: { value: '2012-12-12T10:25:12' } })

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ startDate: '2012-12-12T10:25:12.000Z' }))
    })
  })

  describe('endDate filter', () => {
    beforeEach(() => {
      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({ resolvedOptions: () => ({ timeZone: 'UTC' }) }))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('converts the local datetime to UTC before querying', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ id: '1', contact: { name: 'Contact' } }] })

      mount({ currentUser })

      fireEvent.change(screen.getByLabelText('messages.startDateLabel'), { target: { value: '2012-12-12T10:00:00' } })
      fireEvent.change(screen.getByLabelText('messages.endDateLabel'), { target: { value: '2012-12-12T18:14:37' } })

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ endDate: '2012-12-12T18:14:37.000Z' }))
    })
  })

  describe('kind filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ id: '1', contact: { name: 'Contact' } }] })

      mount({ currentUser })

      fireEvent.change(screen.getByLabelText('messages.kindLabel'), { target: { value: 'text' } })

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ kind: 'text' }))
    })
  })

  describe('destination filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ id: '1', contact: { name: 'Contact' } }] })

      mount({ currentUser })

      fireEvent.change(screen.getByLabelText('messages.destinationLabel'), { target: { value: 'to-chat' } })

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ destination: 'to-chat' }))
    })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      const currentUser = { role: 'agent' }

      mount({ currentUser })

      await screen.findByLabelText('messages.contactFilter')

      expect(screen.queryByLabelText('messages.licenseeFilter')).not.toBeInTheDocument()
    })

    it('changes the filters to get the messages', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getMessages.mockResolvedValueOnce({ status: 201, data: [{ id: '1', contact: { name: 'Contact' } }] })

      mount({ currentUser })

      await screen.findByLabelText('messages.contactFilter')

      fireEvent.change(screen.getByLabelText('messages.licenseeFilter'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Alcateia')

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })

  describe('contact select filter', () => {
    it('changes the filters to get the messages', async () => {
      getContacts.mockResolvedValueOnce({ status: 201, data: [{ _id: '9876543', name: 'John Doe', number: '12345' }] })

      getMessages.mockResolvedValueOnce({ status: 201, data: [{ id: '2', contact: { name: 'John Doe' } }] })

      mount({ currentUser })

      fireEvent.change(screen.getByLabelText('messages.contactFilter'), { target: { value: 'john' } })

      fireEvent.click(await screen.findByText('John Doe | 12345'))

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('John Doe')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ contact: '9876543' }))
    })

    it('re-fetches contacts filtered by licensee when activeLicensee is set', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [] })

      const activeLicensee = { id: 'licensee-xyz', _id: 'licensee-xyz', name: 'Test Licensee' }
      const Stub = createRoutesStub([
        {
          path: '/messages',
          Component: () => (
            <AppContext.Provider value={{ activeLicensee, updateActiveLicensee: vi.fn() }}>
              <MessageIndex currentUser={{ role: 'super' }} />
            </AppContext.Provider>
          ),
        },
      ])
      render(<Stub initialEntries={['/messages']} />)

      await waitFor(() => {
        expect(getContacts).toHaveBeenCalledWith(expect.objectContaining({ licensee: 'licensee-xyz' }))
      })
    })
  })

  describe('retry button', () => {
    it('shows the retry button when a message has an error', async () => {
      getMessages.mockResolvedValueOnce({
        status: 201,
        data: [{ id: '1', contact: { name: 'Contact' }, error: 'Some error' }],
      })

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))

      expect(await screen.findByRole('button', { name: 'messages.resend' })).toBeInTheDocument()
    })

    it('does not show the retry button when a message has no error', async () => {
      getMessages.mockResolvedValueOnce({
        status: 201,
        data: [{ id: '1', contact: { name: 'Contact' } }],
      })

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(screen.queryByRole('button', { name: 'messages.resend' })).not.toBeInTheDocument()
    })

    it('calls resendMessage with the message id on click', async () => {
      getMessages.mockResolvedValueOnce({
        status: 201,
        data: [{ id: 'msg1', contact: { name: 'Contact' }, error: 'Some error' }],
      })
      resendMessage.mockResolvedValue({})

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))
      fireEvent.click(await screen.findByRole('button', { name: 'messages.resend' }))

      expect(resendMessage).toHaveBeenCalledWith('msg1')
    })

    it('shows success feedback after a successful retry', async () => {
      getMessages.mockResolvedValueOnce({
        status: 201,
        data: [{ id: 'msg1', contact: { name: 'Contact' }, error: 'Some error' }],
      })
      resendMessage.mockResolvedValue({})

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))
      fireEvent.click(await screen.findByRole('button', { name: 'messages.resend' }))

      expect(await screen.findByText('messages.resendSuccess')).toBeInTheDocument()
    })

    it('shows error feedback after a failed retry', async () => {
      getMessages.mockResolvedValueOnce({
        status: 201,
        data: [{ id: 'msg1', contact: { name: 'Contact' }, error: 'Some error' }],
      })
      resendMessage.mockRejectedValue(new Error('network error'))

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))
      fireEvent.click(await screen.findByRole('button', { name: 'messages.resend' }))

      expect(await screen.findByText('messages.resendError')).toBeInTheDocument()
    })
  })

  describe('Error details', () => {
    it('is rendered when theres an error', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              id: '1',
              contact: {
                name: 'Contact',
              },
              error: 'This is an error',
            }
          ]
        }
      )

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      const error = await screen.findByText('This is an error')

      expect(error).toBeInTheDocument()

      cleanup()

      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              id: '1',
              contact: {
                name: 'Contact',
              },
            }
          ]
        }
      )

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(screen.queryByText('This is an error')).not.toBeInTheDocument()

    })
  })

  describe('file download link', () => {
    it('is rendered when theres a file with name and link', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              id: '1',
              contact: {
                name: 'Contact',
              },
              fileName: 'File name',
              url: 'google.com'
            }
          ]
        }
      )

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      const link = await screen.findByText('File name')

      expect(link).toHaveAttribute('href', 'google.com')

      cleanup()

      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              id: '1',
              contact: {
                name: 'Contact',
              },
            }
          ]
        }
      )

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(screen.queryByText('File name')).not.toBeInTheDocument()
    })
  })

  describe('location link', () => {
    it('is rendered when theres a cordinate', async () => {
      getMessages.mockResolvedValueOnce({
        status: 201,
        data: [
          {
            id: '1',
            contact: {
              name: 'Contact',
            },
            kind: 'location',
            latitude: '-25.5617048',
            longitude: '-49.3086837',
          },
        ],
      })

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      expect(await screen.findByText('(-25.5617048, -49.3086837)')).toBeInTheDocument()

      const link = screen.getByRole('link')

      expect(link).toHaveAttribute('href', 'http://maps.google.com/maps?q=-25.5617048,-49.3086837&ll=-25.5617048,-49.3086837&z=17')
    })
  })

  describe('interactive link', () => {
    it('is rendered when theres a trigger', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              id: '1',
              contact: {
                name: 'Contact',
              },
              kind: 'interactive',
              trigger: {
                _id: '123235',
                name: 'Trigger',
              },
            }
          ]
        }
      )

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      expect(await screen.findByText('messages.kindInteractive')).toBeInTheDocument()

      const link = screen.getByText('Trigger')

      expect(link).toHaveAttribute('href', '#/triggers/123235')
    })
  })

  describe('cart description', () => {
    it('is rendered when theres a cart', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              id: '1',
              contact: {
                name: 'Contact',
              },
              kind: 'interactive',
              trigger: {
                _id: '123235',
                name: 'Trigger',
              },
            }
          ]
        }
      )

      mount({ currentUser })

      fireEvent.click(screen.getByText('messages.searchButton'))

      expect(await screen.findByText('messages.kindInteractive')).toBeInTheDocument()

      const link = screen.getByText('Trigger')

      expect(link).toHaveAttribute('href', '#/triggers/123235')
    })
  })

  describe('department badge', () => {
    it('renders the department badge when message has a department', async () => {
      getMessages.mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
            contact: { name: 'Contact' },
            department: { _id: 'department-id-1', name: 'Vendas' },
          },
        ],
      })

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))

      expect(await screen.findByText('Vendas')).toBeInTheDocument()
    })

    it('does not render a department badge when message has no department', async () => {
      getMessages.mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
            contact: { name: 'Contact' },
            department: null,
          },
        ],
      })

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(screen.queryByText('Vendas')).not.toBeInTheDocument()
    })

    it('does not render a department badge when department field is absent', async () => {
      getMessages.mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
            contact: { name: 'Contact' },
          },
        ],
      })

      mount({ currentUser })
      fireEvent.click(screen.getByText('messages.searchButton'))

      await screen.findByText('Contact')

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})
