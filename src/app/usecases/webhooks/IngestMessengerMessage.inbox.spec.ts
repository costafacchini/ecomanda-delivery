import { BodyRepositoryMemory } from '@repositories/body'
import { IngestMessengerMessage } from './IngestMessengerMessage'

describe('IngestMessengerMessage — inbox threading', () => {
  it('saves inboxId on the Body record when inboxId is provided', async () => {
    const messengerRepository = new BodyRepositoryMemory()
    const jobQueue = { addJob: jest.fn().mockResolvedValue(undefined) }
    const ingestMessengerMessage = new IngestMessengerMessage({ messengerRepository, jobQueue })

    const bodySaved = await ingestMessengerMessage.execute({
      body: { message: 'hello' },
      licenseeId: 'licensee-id',
      inboxId: 'inbox-123',
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        inbox: 'inbox-123',
      }),
    )
  })

  it('saves null inboxId on Body record when inboxId is not provided', async () => {
    const messengerRepository = new BodyRepositoryMemory()
    const jobQueue = { addJob: jest.fn().mockResolvedValue(undefined) }
    const ingestMessengerMessage = new IngestMessengerMessage({ messengerRepository, jobQueue })

    const bodySaved = await ingestMessengerMessage.execute({
      body: { message: 'hello' },
      licenseeId: 'licensee-id',
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        inbox: null,
      }),
    )
  })
})
