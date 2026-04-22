import path from 'path'
jest.mock('../app/routes/login-route.js', () => ({
  router: jest.fn(),
}))

jest.mock('../app/routes/resources-routes.js', () => jest.fn())
jest.mock('../app/routes/api-routes.js', () => jest.fn())
jest.mock('../app/routes/bull-board-route.js', () => jest.fn())

import { routes } from './routes.js'

describe('routes config', () => {
  it('serves the Vite index file for unmatched routes', () => {
    const app = {
      use: jest.fn(),
      get: jest.fn(),
    }

    routes(app)

    expect(app.get).toHaveBeenCalledWith(/.*/, expect.any(Function))

    const handler = app.get.mock.calls[0][1]
    const res = { sendFile: jest.fn() }

    handler({}, res)

    expect(res.sendFile).toHaveBeenCalledWith(path.resolve(process.cwd(), 'client/dist/index.html'))
  })
})
