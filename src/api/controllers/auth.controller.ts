import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';

const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    //TODO use hashing like bycrpt

    const payload = {
      username: req.body.username,
      password: req.body.password
    };
    // const user1 = await UserModel.find();
    // console.log(user1);

    const user: IUser = await UserModel.findOne(payload);
    // console.log(user);
    //TODO don't user exact password
    if (user.password !== req.body.password) {
      throw new Error('Unauthorized');
    }

    const token = jwt.sign({ username: payload['username'] }, jwtSecret, {
      expiresIn: jwtExpirationInterval
    });
    res.status(httpStatus.OK).send({ token });
  } catch (err) {
    // logger error
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

export { authenticateUser };
