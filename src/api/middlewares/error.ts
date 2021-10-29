import * as httpStatus from 'http-status';
import APIError from './api-error';
import { env } from '../../config/vars';
import { Request, Response, NextFunction } from 'express';

/**
 * Error handler. Send stacktrace only during development
 * @public
 */

const handler = (err: APIError | Error, _req: Request, res: Response) => {
  const response = {
    code: err instanceof APIError ? err.status : '',
    message: err.message,
    errors: err instanceof APIError ? err.errors : '',
    stack: err.stack
  };

  if (env !== 'development') {
    delete response.stack;
  }

  const statusCode =
    err instanceof APIError ? err.status : httpStatus.INTERNAL_SERVER_ERROR;
  res.status(statusCode).send(response);
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */

const converter = (
  err: APIError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let convertedError = err;
  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err instanceof APIError ? err.status : httpStatus[500],
      stack: err.stack,
      errors: ''
    });
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
const notFound = (req: Request, res: Response, _next: NextFunction) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
    stack: '',
    errors: ''
  });
  return handler(err, req, res);
};

export { notFound, converter, handler };
