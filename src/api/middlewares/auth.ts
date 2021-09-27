import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import * as passport from 'passport';

//Duplicate type need to find a way to declare global types
interface IJWTTOKEN {
  userName: string;
  iat: number;
  exp: number;
}

const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  passport.authenticate('jwt', (err: Error, jwtToken: IJWTTOKEN) => {
    if (err) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (!jwtToken) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    } else {
      return next();
    }
  })(req, res, next);
};

export { authenticateJWT };
