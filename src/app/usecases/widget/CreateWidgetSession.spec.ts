import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { ContactRepositoryMemory } from '@repositories/contact'
import { CreateWidgetSession } from './CreateWidgetSession'

describe('CreateWidgetSession', () => {
  let licenseeRepository: LicenseeRepositoryMemory
  let contactRepository: ContactRepositoryMemory
  let createWidgetSession: CreateWidgetSession

  beforeEach(() => {
    licenseeRepository = new LicenseeRepositoryMemory()
    contactRepository = new ContactRepositoryMemory()
    createWidgetSession = new CreateWidgetSession({ licenseeRepository, contactRepository })
  })

  it('throws an error containing the apiToken when licensee is not found', async () => {
    await expect(
      createWidgetSession.execute({ apiToken: 'unknown-token', name: 'John', email: 'john@doe.com' }),
    ).rejects.toThrow('unknown-token')
  })

  it('creates a web contact and returns a widgetSessionToken when no contact exists', async () => {
    const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))

    const result = await createWidgetSession.execute({
      apiToken: 'valid-token',
      name: 'Jane Doe',
      email: 'jane@doe.com',
    })

    expect(result.widgetSessionToken).toBeDefined()
    expect(result.widgetSessionToken).toHaveLength(36)
    expect(result.contactId).toBeDefined()
    expect(result.licenseeId).toEqual(licensee._id.toString())

    const created = await contactRepository.findFirst({ email: 'jane@doe.com', type: 'web' })
    expect(created).not.toBeNull()
    expect(created.name).toEqual('Jane Doe')
    expect(created.type).toEqual('web')
  })

  it('stores the provided phone as number on the created contact', async () => {
    await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))

    await createWidgetSession.execute({
      apiToken: 'valid-token',
      name: 'Jane Doe',
      email: 'jane@doe.com',
      phone: '5511999990000',
    })

    const created = await contactRepository.findFirst({ email: 'jane@doe.com', type: 'web' })
    expect(created.number).toEqual('5511999990000')
  })

  it('defaults number to 00000000000 when phone is omitted', async () => {
    await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))

    await createWidgetSession.execute({
      apiToken: 'valid-token',
      name: 'Jane Doe',
      email: 'jane@doe.com',
    })

    const created = await contactRepository.findFirst({ email: 'jane@doe.com', type: 'web' })
    expect(created.number).toEqual('00000000000')
  })

  it('generates a widgetSessionToken and returns it when contact exists without one', async () => {
    const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))
    await contactRepository.create(
      contactFactory.build({
        email: 'jane@doe.com',
        type: 'web',
        licensee: licensee._id,
        widgetSessionToken: undefined,
      }),
    )

    const saveSpy = jest.spyOn(contactRepository, 'save')

    const result = await createWidgetSession.execute({
      apiToken: 'valid-token',
      name: 'Jane Doe',
      email: 'jane@doe.com',
    })

    expect(result.widgetSessionToken).toBeDefined()
    expect(result.widgetSessionToken).toHaveLength(36)
    expect(saveSpy).toHaveBeenCalledTimes(1)
  })

  it('returns the existing widgetSessionToken unchanged when contact already has one', async () => {
    const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))
    const existingToken = 'existing-session-token-uuid-1234'
    await contactRepository.create(
      contactFactory.build({
        email: 'jane@doe.com',
        type: 'web',
        licensee: licensee._id,
        widgetSessionToken: existingToken,
      }),
    )

    const saveSpy = jest.spyOn(contactRepository, 'save')

    const result = await createWidgetSession.execute({
      apiToken: 'valid-token',
      name: 'Jane Doe',
      email: 'jane@doe.com',
    })

    expect(result.widgetSessionToken).toEqual(existingToken)
    expect(saveSpy).not.toHaveBeenCalled()
  })
})
