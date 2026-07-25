import { LocalStorage } from './Local'

describe('LocalStorage', () => {
  const licensee = { _id: 'lic1' }
  const contact = { number: '5511999990001' }
  const fileName = 'test.jpg'
  const fileBase64 = 'data:image/jpeg;base64,/9j/abc123'

  describe('uploadFile', () => {
    it.todo('saves the decoded base64 file to LOCAL_STORAGE_PATH/<date>/<number>/<fileName>')
    it.todo('creates intermediate directories if they do not exist')
    it.todo('strips the data URI prefix before writing')
  })

  describe('presignedUrl', () => {
    it.todo('returns APP_URL/uploads/<date>/<number>/<fileName>')
    it.todo('uses http://localhost:5000 as default APP_URL when env var is not set')
  })
})
