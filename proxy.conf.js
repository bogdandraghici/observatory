var winston = require('winston')

function logProvider() {
  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.splat(), winston.format.simple()),
    transports: [new winston.transports.Console()],
  })
}

// Pointed at dev-cls1 / dev-pr2127. To go back to local docker compose,
// restore target=http://localhost:8091 and remove pathRewrite.
module.exports = {
  '/api/': {
    target: 'https://services.cloud.pr2127.dev1.flowxai.dev',
    secure: true,
    changeOrigin: true,
    pathRewrite: { '^/api/': '/ai-observatory/api/' },
    logLevel: 'debug',
    logProvider: logProvider,
  },
}
