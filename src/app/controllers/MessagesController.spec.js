import { MessagesController } from './MessagesController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const messagesQueryInstance = {
    page: jest.fn(),
    limit: jest.fn(),
    filterByCreatedAt: jest.fn(),
    filterByLicensee: jest.fn(),
    filterByContact: jest.fn(),
    filterByKind: jest.fn(),
    filterByDestination: jest.fn(),
    filterBySended: jest.fn(),
    all: jest.fn(),
  }
  const createMessagesQuery = jest.fn().mockReturnValue(messagesQueryInstance)

  const controller = new MessagesController({ createMessagesQuery })

  return { controller, createMessagesQuery, messagesQueryInstance }
}

describe('MessagesController delegation', () => {
  it('delegates index to messagesQuery and returns status 200', async () => {
    const { controller, messagesQueryInstance } = buildController()
    const messages = [{ _id: 'msg-id', text: 'Message 1' }]
    messagesQueryInstance.all.mockResolvedValue(messages)

    const req = { query: { page: '1', limit: '10', destination: 'to-chat', kind: 'text', sended: 'true' } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(messagesQueryInstance.page).toHaveBeenCalledWith('1')
    expect(messagesQueryInstance.limit).toHaveBeenCalledWith('10')
    expect(messagesQueryInstance.filterByDestination).toHaveBeenCalledWith('to-chat')
    expect(messagesQueryInstance.filterByKind).toHaveBeenCalledWith('text')
    expect(messagesQueryInstance.filterBySended).toHaveBeenCalledWith('true')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(messages)
  })

  it('filters by date range when startDate and endDate are provided', async () => {
    const { controller, messagesQueryInstance } = buildController()
    messagesQueryInstance.all.mockResolvedValue([])

    const startDate = '2021-07-01T00:00:00.000Z'
    const endDate = '2021-07-05T00:00:00.000Z'
    const req = { query: { page: '1', limit: '10', startDate, endDate } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(messagesQueryInstance.filterByCreatedAt).toHaveBeenCalledWith(new Date(startDate), new Date(endDate))
  })

  it('filters by licensee and contact when provided', async () => {
    const { controller, messagesQueryInstance } = buildController()
    messagesQueryInstance.all.mockResolvedValue([])

    const req = { query: { page: '1', limit: '10', licensee: 'licensee-id', contact: 'contact-id' } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(messagesQueryInstance.filterByLicensee).toHaveBeenCalledWith('licensee-id')
    expect(messagesQueryInstance.filterByContact).toHaveBeenCalledWith('contact-id')
  })
})
