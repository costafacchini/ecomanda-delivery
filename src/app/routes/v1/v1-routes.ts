import express from 'express'
import { param, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../../helpers/SanitizeErrors'
import { ChatsController } from '../../controllers/ChatsController'
import { ChatbotsController } from '../../controllers/ChatbotsController'
import { MessengersController } from '../../controllers/MessengersController'
import { BackupsController } from '../../controllers/BackupsController'
import { AdressesController } from '../../controllers/Contacts/AdressesController'
import { DelayController } from '../../controllers/DelayController'
import { BackgroundjobsController } from '../../controllers/BackgroundjobsController'
import { ScheduleBackgroundjob } from '../../usecases/backgroundjobs/ScheduleBackgroundjob'
import { GetBackgroundjobStatus } from '../../usecases/backgroundjobs/GetBackgroundjobStatus'
import { UpdateContactAddress } from '../../usecases/contacts/UpdateContactAddress'
import { IngestChatMessage } from '../../usecases/webhooks/IngestChatMessage'
import { IngestMessengerMessage } from '../../usecases/webhooks/IngestMessengerMessage'
import { queueServer } from '../../../config/queue'
import { publishMessage } from '../../../config/rabbitmq'
import { NormalizePhone } from '../../helpers/NormalizePhone'
import { createRuntimeDependencies } from '../../runtime/dependencies'

const router = express.Router()

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
const {
  bodyRepository,
  contactRepository,
  backgroundjobRepository,
} = createRuntimeDependencies()

const ingestChatMessage = new IngestChatMessage({ chatRepository: bodyRepository, jobQueue: queueServer })
const ingestMessengerMessage = new IngestMessengerMessage({
  messengerRepository: bodyRepository,
  jobQueue: queueServer,
})

const chatsController = new ChatsController({ ingestChatMessage, publishMessage })
const chatbotsController = new ChatbotsController({ bodyRepository, queueServer, publishMessage })
const messengersController = new MessengersController({ ingestMessengerMessage })
const backupsController = new BackupsController({ publishMessage })
const adressesController = new AdressesController({
  contactRepository,
  normalizePhone: (number: any) => new NormalizePhone(number),
  updateContactAddress: new UpdateContactAddress({
    contactRepository,
    normalizePhone: (number: any) => new NormalizePhone(number),
  }),
})
const delayController = new DelayController()
const backgroundjobsController = new BackgroundjobsController({
  scheduleBackgroundjob: new ScheduleBackgroundjob({ backgroundjobRepository, jobQueue: queueServer }),
  getBackgroundjobStatus: new GetBackgroundjobStatus({ backgroundjobRepository }),
})

router.post('/chat/message', chatsController.message)
router.post('/chat/reset', chatsController.reset)

router.post('/chatbot/message', chatbotsController.message)
router.post('/chatbot/transfer', chatbotsController.transfer)
router.post('/chatbot/reset', chatbotsController.reset)

router.post('/messenger/message', messengersController.message)

router.post('/backups/schedule', backupsController.schedule)
router.post('/backups/clear', backupsController.clear)

router.get('/contacts/address/:number', adressesController.show)
router.post('/contacts/address/:number', adressesController.update)

router.get('/delay/:time', delayValidations(), validate, delayController.time)
router.post('/delay/:time', delayValidations(), validate, delayController.time)

router.get('/backgroundjobs/:id', backgroundjobsController.show)
router.post('/backgroundjobs', backgroundjobsController.create)

export default router
