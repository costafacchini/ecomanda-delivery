import { BodyRepositoryMemory } from '@repositories/body'
import { MESSENGER_MESSAGE_KIND, MESSENGER_MESSAGE_JOB, IngestMessengerMessage } from './IngestMessengerMessage'

describe('IngestMessengerMessage', () => {
  it('saves the body and enqueues the messenger-message job', async () => {
    const messengerRepository = new BodyRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const ingestMessengerMessage = new IngestMessengerMessage({ messengerRepository, jobQueue })

    const bodySaved = await ingestMessengerMessage.execute({
      body: { message: 'hello', from: 'user-2' },
      licenseeId: 'licensee-id',
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        content: { message: 'hello', from: 'user-2' },
        licensee: 'licensee-id',
        kind: MESSENGER_MESSAGE_KIND,
      }),
    )

    expect(jobQueue.addJob).toHaveBeenCalledWith(MESSENGER_MESSAGE_JOB, {
      bodyId: bodySaved._id,
      licenseeId: 'licensee-id',
    })
  })

  it('saves the body with sector null when sectorId is not provided', async () => {
    const messengerRepository = new BodyRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const ingestMessengerMessage = new IngestMessengerMessage({ messengerRepository, jobQueue })

    const bodySaved = await ingestMessengerMessage.execute({
      body: { message: 'hello' },
      licenseeId: 'licensee-id',
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        sector: null,
      }),
    )
  })

  it('saves the body with sector populated when sectorId is provided', async () => {
    const messengerRepository = new BodyRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const ingestMessengerMessage = new IngestMessengerMessage({ messengerRepository, jobQueue })

    const bodySaved = await ingestMessengerMessage.execute({
      body: { message: 'hello' },
      licenseeId: 'licensee-id',
      sectorId: 'sector-123',
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        sector: 'sector-123',
      }),
    )
  })
})
