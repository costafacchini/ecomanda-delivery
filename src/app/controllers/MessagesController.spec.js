import User from '@models/User'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { expressServer } from '../../../.jest/server-express'
import { userSuper as userSuperFactory } from '@factories/user'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'

describe('messengers controller', () => {
  let token

  beforeAll(async () => {
    await mongoServer.connect()

    await User.create(userSuperFactory.build())

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .send({
          name: 'Alcateia Ltda',
        })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token is invalid', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .set('x-access-token', 'invalid')
        .send({ name: 'Mary Jane' })
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and return messages', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())
        const another_licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee }))
        const another_contact = await contactRepository.create(contactFactory.build({ licensee }))

        const messageRepository = new MessageRepositoryDatabase()
        await messageRepository.create(messageFactory.build({ licensee, contact }))
        await messageRepository.create(
          messageFactory.build({ licensee, contact, createdAt: new Date(2021, 5, 30, 0, 0, 0) }),
        )
        await messageRepository.create(
          messageFactory.build({ licensee, contact, createdAt: new Date(2021, 6, 5, 0, 0, 0) }),
        )
        await messageRepository.create(messageFactory.build({ destination: 'to-chatbot', licensee, contact }))
        await messageRepository.create(messageFactory.build({ licensee: another_licensee, contact }))
        await messageRepository.create(messageFactory.build({ licensee, contact: another_contact }))
        await messageRepository.create(messageFactory.build({ licensee, contact, kind: 'interactive' }))
        await messageRepository.create(messageFactory.build({ licensee, contact, sended: false }))

        await request(expressServer)
          .get(
            `/resources/messages/?page=1&limit=10&destination=to-chat&startDate=2021-07-01T00:00:00.000Z&endDate=2021-07-05T00:00:00.000Z&licensee=${licensee._id}&contact=${contact._id}&kind=text&sended=true`,
          )
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(1)
            expect(response.body[0].text).toEqual('Message 1')
            expect(response.body[0].number).toEqual('5511990283745')
            expect(response.body[0].destination).toEqual('to-chat')
            expect(response.body[0].sended).toEqual(true)
          })
      })
    })
  })
})
