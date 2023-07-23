import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { WithAuthProp } from '@clerk/clerk-sdk-node'

const getHealth = (_req: WithAuthProp<Request>, response: Response): void => {
  console.log(_req.auth)
  response.sendStatus(httpStatus.OK);
};

export { getHealth };
