import Inbox from '@models/Inbox'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import mongoose from 'mongoose'

describe('Inbox', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const inbox = await Inbox.create({ name: 'Suporte', licensee, kind: 'messenger' })

      expect(inbox._id).not.toBeNull()
    })

    it('defaults active to true', () => {
      const inbox = new Inbox({ name: 'Suporte', kind: 'messenger' })

      expect(inbox.active).toEqual(true)
    })

    it('auto-generates inboxToken as a UUID string', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const inbox = await Inbox.create({ name: 'Suporte', licensee, kind: 'messenger' })

      expect(inbox.inboxToken).toMatch(/^[0-9a-f-]{36}$/)
    })
  })

  describe('webhookUrl virtual', () => {
    it('returns webhookUrl when licensee is populated and kind is messenger', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const inbox = await Inbox.create({ name: 'Suporte', licensee, kind: 'messenger' })
      const populated = await Inbox.findById(inbox._id).populate('licensee')

      expect(populated!.webhookUrl).toMatch(new RegExp(`token=${licensee.apiToken}&inbox=${inbox.inboxToken}`))
    })

    it('returns null when licensee is not populated', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const inbox = await Inbox.create({ name: 'Suporte', licensee, kind: 'messenger' })
      const unpopulated = await Inbox.findById(inbox._id)

      expect(unpopulated!.webhookUrl).toBeNull()
    })

    it('returns null when kind is chat', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const inbox = await Inbox.create({ name: 'Chat Inbox', licensee, kind: 'chat' })
      const populated = await Inbox.findById(inbox._id).populate('licensee')

      expect(populated!.webhookUrl).toBeNull()
    })
  })

  describe('validations', () => {
    it('fails when name is missing', async () => {
      const inbox = new Inbox({ kind: 'messenger', licensee: new mongoose.Types.ObjectId() })
      const error = await inbox.validate().catch((e: any) => e)

      expect(error?.errors['name']).toBeDefined()
    })

    it('fails when licensee is missing', async () => {
      const inbox = new Inbox({ name: 'Suporte', kind: 'messenger' })
      const error = await inbox.validate().catch((e: any) => e)

      expect(error?.errors['licensee']).toBeDefined()
    })

    it('fails when kind is missing', async () => {
      const inbox = new Inbox({ name: 'Suporte', licensee: new mongoose.Types.ObjectId() })
      const error = await inbox.validate().catch((e: any) => e)

      expect(error?.errors['kind']).toBeDefined()
    })

    it('passes with name, licensee, and kind', async () => {
      const inbox = new Inbox({
        name: 'Suporte',
        licensee: new mongoose.Types.ObjectId(),
        kind: 'messenger',
      })
      const error = await inbox.validate().catch((e: any) => e)

      expect(error).toBeUndefined()
    })
  })
})
