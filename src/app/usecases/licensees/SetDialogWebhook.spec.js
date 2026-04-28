import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { SetDialogWebhook, WEBHOOK_CONFIGURED_MESSAGE } from './SetDialogWebhook.js'

describe('SetDialogWebhook', () => {
  it('configures the webhook when the licensee uses dialog', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const messengerPlugin = {
      setWebhook: jest.fn(),
    }
    const createMessengerPlugin = jest.fn().mockReturnValue(messengerPlugin)
    const setDialogWebhook = new SetDialogWebhook({ licenseeRepository, createMessengerPlugin })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

    const response = await setDialogWebhook.execute(licensee._id)

    expect(createMessengerPlugin).toHaveBeenCalledWith(licensee)
    expect(messengerPlugin.setWebhook).toHaveBeenCalledWith(licensee.whatsappUrl, licensee.whatsappToken)
    expect(response).toEqual({ message: WEBHOOK_CONFIGURED_MESSAGE })
  })

  it('returns success without calling the plugin when the licensee is not using dialog', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const messengerPlugin = {
      setWebhook: jest.fn(),
    }
    const createMessengerPlugin = jest.fn().mockReturnValue(messengerPlugin)
    const setDialogWebhook = new SetDialogWebhook({ licenseeRepository, createMessengerPlugin })
    const licensee = await licenseeRepository.create(
      licenseeCompleteFactory.build({ whatsappDefault: 'utalk', whatsappUrl: 'https://v1.utalk.chat/send/' }),
    )

    const response = await setDialogWebhook.execute(licensee._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(messengerPlugin.setWebhook).not.toHaveBeenCalled()
    expect(response).toEqual({ message: WEBHOOK_CONFIGURED_MESSAGE })
  })
})
