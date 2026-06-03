import express from 'express'
import jwt from 'jsonwebtoken'
import { param, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../../helpers/SanitizeErrors'
import { ChatsController } from '../../controllers/ChatsController'
import { ChatbotsController } from '../../controllers/ChatbotsController'
import { MessengersController } from '../../controllers/MessengersController'
import { BackupsController } from '../../controllers/BackupsController'
import { DelayController } from '../../controllers/DelayController'
import { ChatRoomsController } from '../../controllers/ChatRoomsController'
import { IngestChatMessage } from '../../usecases/webhooks/IngestChatMessage'
import { IngestMessengerMessage } from '../../usecases/webhooks/IngestMessengerMessage'
import { queueServer } from '../../../config/queue'
import { createRuntimeDependencies } from '../../runtime/dependencies'

const router = express.Router()
const SECRET = process.env.SECRET as string

function authenticate(req: any, res: any, next: any) {
  const token = req.headers['x-access-token']
  if (!token) return res.status(401).json({ auth: false, message: 'Token não informado.' })

  jwt.verify(token, SECRET, function (err: any, decoded: any) {
    if (err) return res.status(401).json({ auth: false, message: 'Falha na autenticação com token.' })
    req.userId = decoded.id
    next()
  })
}

function validate(req: any, res: any, next: any) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
  }
  next()
}

function delayValidations() {
  return [param('time').isInt({ min: 0, max: 30000 }).withMessage('time deve ser um inteiro entre 0 e 30000')]
}

// Composition root for v1 routes. Separate instance from resources-routes intentionally;
// each route module owns its own subset of dependencies.
const { bodyRepository, userRepository, roomRepository } = createRuntimeDependencies()

const ingestChatMessage = new IngestChatMessage({ chatRepository: bodyRepository, jobQueue: queueServer })
const ingestMessengerMessage = new IngestMessengerMessage({
  messengerRepository: bodyRepository,
  jobQueue: queueServer,
})

const chatsController = new ChatsController({ ingestChatMessage, queueServer })
const chatbotsController = new ChatbotsController({ bodyRepository, queueServer })
const messengersController = new MessengersController({ ingestMessengerMessage })
const backupsController = new BackupsController({ queueServer })
const delayController = new DelayController()
const chatRoomsController = new ChatRoomsController({ userRepository, roomRepository, ingestChatMessage })

router.post('/chat/message', chatsController.message)
router.post('/chat/reset', chatsController.reset)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)
router.post('/chatbot/reset', chatbotsController.reset)

router.post('/messenger/message', messengersController.message)

router.post('/backups/schedule', backupsController.schedule)
router.post('/backups/clear', backupsController.clear)

router.get('/delay/:time', delayValidations(), validate, delayController.time)
router.post('/delay/:time', delayValidations(), validate, delayController.time)

router.post('/chat/rooms/:roomId/messages', authenticate, chatRoomsController.replyToRoom)

export default router
