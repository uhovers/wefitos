require('winston-daily-rotate-file');
const { createLogger, format, transports } = require('winston');

const transportConsole = new transports.Console({
  json: false,
  prettyPrint:true,
  colorize: true,
  level:'debug',
});

const dailyTransportFile = new transports.DailyRotateFile({
  filename: './logfile/wefitos-%DATE%.log',
  prepend: true,
  zippedArchive: true,
  datePattern: 'YYYY-MM-DD',
  maxSize: '5m',
  maxFiles: "30d"
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" ")),
    // format.errors({ stack: true }),
    // format.splat(),
    // format.json()
  ),
  transports: [
    transportConsole,
    dailyTransportFile
  ]
});

const dateLog = {
  info: (...args) => {
    logger.info({level:'info', message: args})
  }
}

exports.logger = dateLog;

//test
// logger.info({level:'info', message: 'testsadasa'})