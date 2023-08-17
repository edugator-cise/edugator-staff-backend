import * as morgan from 'morgan';
import { logger } from '../services/winston';

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: morgan.StreamOptions = {
  // Use the http severity
  write: (message) => logger.http(message)
};

export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);
