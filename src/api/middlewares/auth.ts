import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import * as passport from 'passport';

//Duplicate type need to find a way to declare global types
interface IJWTTOKEN {
  username: string;
  iat: number;
  exp: number;
  role: string;
}

const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('jwt', (err: Error, jwtToken: IJWTTOKEN) => {
    if (err) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (!jwtToken) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    } else {
      //Sets the local variable to the next middleware
      res.locals.role = jwtToken.role;
      return next();
    }
  })(req, res, next);
};

export { authenticateJWT };
