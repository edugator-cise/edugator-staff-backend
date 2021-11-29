import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';
import * as bcrypt from 'bcrypt';

// Logs the validated user in
const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    }

    const payload = {
      username: req.body.username
    };

    const user: IUser = await UserModel.findOne(payload);

    if (!user) {
      res.status(401).type('json').send({
        message: 'User with given username is not found - Unauthorized'
      });
      return;
    }

    // Compares the passed in password to the hashed password in the collection
    bcrypt.compare(req.body.password, user.password, function (_err, result) {
      try {
        if (result) {
          const token = jwt.sign(
            { username: payload['username'], role: user.role },
            jwtSecret,
            {
              expiresIn: jwtExpirationInterval
            }
          );
          res.status(httpStatus.OK).send({ token });
        } else {
          res.status(401).type('json').send({
            message: 'Invalid Password - Unauthorized'
          });
          return;
          // throw { message: 'Invalid Password - Unauthorized' };
        }
      } catch (err) {
        res.status(400).type('json').send(err);
      }
    });
  } catch (err) {
    // catches empty body error - the other errors are dealt with individually
    res.status(400).type('json').send(err);
    // res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

export { authenticateUser };
