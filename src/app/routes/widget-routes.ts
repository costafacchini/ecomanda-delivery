import express from 'express'
import cors from 'cors'
import { body, query, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../helpers/SanitizeErrors'
import { CreateWidgetSession } from '../usecases/widget/CreateWidgetSession'
import { SendWidgetMessage } from '../usecases/widget/SendWidgetMessage'
import { GetWidgetMessages } from '../usecases/widget/GetWidgetMessages'
import { createRuntimeDependencies } from '../runtime/dependencies'

const router = express.Router()

// Allow cross-origin requests from any embedded widget host.
router.use(cors())

function validate(req: any, res: any, next: any) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
  }
  next()
}

// Composition root. Called once at module load time in production;
// replaced via jest.mock in tests so no live DB connection is needed.
const { licenseeRepository, contactRepository, messageRepository, roomRepository } = createRuntimeDependencies()

const createWidgetSession = new CreateWidgetSession({ licenseeRepository, contactRepository })
const sendWidgetMessage = new SendWidgetMessage({
  licenseeRepository,
  contactRepository,
  messageRepository,
  roomRepository,
})
const getWidgetMessages = new GetWidgetMessages({
  licenseeRepository,
  contactRepository,
  roomRepository,
  messageRepository,
})

// POST /:apiToken/session — create or resume a widget session for the visitor
router.post(
  '/:apiToken/session',
  [body('name').notEmpty(), body('email').isEmail(), body('phone').optional()],
  validate,
  async (req: any, res: any) => {
    const { apiToken } = req.params
    const { name, email, phone } = req.body
    try {
      const result = await createWidgetSession.execute({ apiToken, name, email, phone })
      return res.status(200).json(result)
    } catch (err: any) {
      if (err.message?.includes('not found')) return res.status(404).json({ message: err.message })
      return res.status(500).json({ message: err.message })
    }
  },
)

// POST /:apiToken/messages — send a message from the widget visitor
router.post(
  '/:apiToken/messages',
  [body('widgetSessionToken').notEmpty(), body('text').notEmpty()],
  validate,
  async (req: any, res: any) => {
    const { apiToken } = req.params
    const { widgetSessionToken, text } = req.body
    try {
      const message = await sendWidgetMessage.execute({ apiToken, widgetSessionToken, text })
      return res.status(201).json(message)
    } catch (err: any) {
      if (err.message?.includes('not found')) return res.status(404).json({ message: err.message })
      return res.status(500).json({ message: err.message })
    }
  },
)

// GET /:apiToken/messages — poll messages for the widget visitor since a given timestamp
router.get('/:apiToken/messages', [query('sessionToken').notEmpty()], validate, async (req: any, res: any) => {
  const { apiToken } = req.params
  const { sessionToken, since } = req.query as { sessionToken: string; since?: string }
  const sinceDate = since ? new Date(since) : undefined
  try {
    const messages = await getWidgetMessages.execute({ apiToken, widgetSessionToken: sessionToken, since: sinceDate })
    return res.status(200).json({ messages })
  } catch (err: any) {
    if (err.message?.includes('not found')) return res.status(404).json({ message: err.message })
    return res.status(500).json({ message: err.message })
  }
})

export default router
