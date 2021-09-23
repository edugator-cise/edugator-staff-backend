import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';

const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    //TODO use hashing like bycrpt
    const { userName, passWord } = req.query;
    const payload = {
      userName: userName as string,
      passWord: passWord as string
    };
    const user: IUser = await UserModel.findOne(payload);

    //TODO don't user exact password
    if (user.passWord !== passWord) {
      throw new Error('Unauthorized');
    }

    const token = jwt.sign({ userName: payload['userName'] }, jwtSecret, {
      expiresIn: jwtExpirationInterval
    });
    res.status(httpStatus.OK).send({ token });
  } catch (err) {
    // logger error
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

export { authenticateUser };
