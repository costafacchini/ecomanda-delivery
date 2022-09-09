const logger = require('pino')({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'req.headers,req.remoteAddress,req.remotePort,res.headers,hostname',
      singleLine: true,
    },
  },
})

module.exports = logger
