import { createLogger, format, transports } from 'winston';

const alignColorsAndTime = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD hh:mm:ss.SSS A'
  }),
  format.printf((info) => `${info.timestamp}  ${info.level} : ${info.message}`)
);

const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.Console({
      format: format.combine(format.colorize({ all: true }), alignColorsAndTime)
    }),
    process.env.NODE_ENV === 'production' &&
      new transports.File({
        filename: 'app-full.log',
        format: alignColorsAndTime
      })
  ].filter(Boolean)
});

export { logger };
