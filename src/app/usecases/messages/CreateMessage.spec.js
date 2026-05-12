import { CreateMessage } from './CreateMessage.js'
import { MessageRepositoryMemory } from '@repositories/message.js'
import { licensee as licenseeFactory } from '@factories/licensee.js'
import { contact as contactFactory } from '@factories/contact.js'

function buildRepositoryAndUseCase(jobQueue) {
  const messageRepository = new MessageRepositoryMemory()
  const useCase = new CreateMessage({ messageRepository, jobQueue })
  return { messageRepository, useCase }
}

describe('CreateMessage', () => {
  describe('field filtering', () => {
    it('creates a message with whitelisted fields and ignores unknown ones', async () => {
      const jobQueue = { addJob: jest.fn() }
      const { useCase } = buildRepositoryAndUseCase(jobQueue)

      const message = await useCase.execute({
        licensee: licenseeFactory.build()._id,
        contact: contactFactory.build()._id,
        kind: 'text',
        destination: 'to-chat',
        text: 'Hello',
        ignoredField: 'should be dropped',
      })

      expect(message.text).toEqual('Hello')
      expect(message.kind).toEqual('text')
      expect(message.ignoredField).toBeUndefined()
    })
  })

  describe('job queuing', () => {
    it('queues send-message-to-messenger when destination is to-messenger', async () => {
      const jobQueue = { addJob: jest.fn().mockResolvedValue({}) }
      const { useCase } = buildRepositoryAndUseCase(jobQueue)

      const message = await useCase.execute({
        kind: 'text',
        destination: 'to-messenger',
        text: 'Hello',
      })

      expect(jobQueue.addJob).toHaveBeenCalledWith('send-message-to-messenger', { messageId: message._id })
    })

    it.each([['to-chat'], ['to-chatbot'], ['to-transfer']])(
      'does not queue a job when destination is %s',
      async (destination) => {
        const jobQueue = { addJob: jest.fn() }
        const { useCase } = buildRepositoryAndUseCase(jobQueue)

        await useCase.execute({ kind: 'text', destination, text: 'Hello' })

        expect(jobQueue.addJob).not.toHaveBeenCalled()
      },
    )
  })
})
