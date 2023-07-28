import * as httpStatus from 'http-status';
import { Request, Response } from 'express';

const getHealth = (_req: Request, response: Response): void => {
  response.sendStatus(httpStatus.OK);
};

export { getHealth };
