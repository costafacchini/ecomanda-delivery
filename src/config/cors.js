import cors from 'cors'

function enableCors(app) {
  app.use(cors())
}

export default enableCors
