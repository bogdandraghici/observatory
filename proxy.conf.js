var winston = require('winston')

function logProvider() {
  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.splat(), winston.format.simple()),
    transports: [new winston.transports.Console()],
  })
}

module.exports = {
  '/api/': {
    target: 'http://localhost:8091',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    logProvider: logProvider,
  },
}
