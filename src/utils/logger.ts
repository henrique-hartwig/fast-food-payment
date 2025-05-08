import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'payments-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaString = Object.keys(meta).length 
            ? `\n${JSON.stringify(meta, null, 2)}` 
            : '';
          return `${timestamp} [${level}]: ${message}${metaString}`;
        })
      )
    })
  ]
});

// Simplificar logs em ambiente de teste
if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach(transport => {
    transport.silent = true;
  });
}

export default logger;