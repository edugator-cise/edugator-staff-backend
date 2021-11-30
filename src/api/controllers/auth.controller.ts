import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';
import * as bcrypt from 'bcrypt';
import userValidation from '../validation/user.validation';

const getUsers = async (_req: Request, res: Response): Promise<void> => {
  // TODO: Do we want TA's to be able to see all people's accounts
  if (res.locals.role !== 'Professor') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  }

  let users: IUser[];
  try {
    //Find All modules
    users = await UserModel.find().select('-password').sort({ role: 1 });
    const responseObject = {
      users: users,
      currentUser: res.locals.username
    };
    res.status(200).send(responseObject);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  if (res.locals.role !== 'Professor') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  }

  const { error } = userValidation(req.body, true);

  if (error) {
    const errorMessage = error.details[0].message;
    const errorMessageNoQuotes = errorMessage.replace(/["]+/g, '');
    res.status(400).type('json').send({
      message: errorMessageNoQuotes
    });
    return;
  }

  let user: IUser;
  try {
    user = await UserModel.findOneAndUpdate(
      {
        username: req.body.username
      },
      {
        name: req.body.name,
        role: req.body.role
      },
      { new: true }
    ).select('-password');

    if (user) {
      res.status(200).type('json').send(user);
    } else {
      res
        .status(400)
        .type('json')
        .send({ message: 'User not found in database' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

const updateRole = async (req: Request, res: Response): Promise<void> => {
  // const newRole = req.body.role;
  if (res.locals.role !== 'Professor') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  }

  //Joi Validation
  const { error } = userValidation(req.body, true);

  if (error) {
    const errorMessage = error.details[0].message;
    const errorMessageNoQuotes = errorMessage.replace(/["]+/g, '');
    res.status(400).type('json').send({
      message: errorMessageNoQuotes
    });
    return;
  }

  let user: IUser;
  try {
    user = await UserModel.findOneAndUpdate(
      {
        username: req.body.username
      },
      {
        role: req.body.role
      },
      { new: true }
    ).select('-password');

    if (user) {
      res.status(200).type('json').send(user);
    } else {
      res
        .status(400)
        .type('json')
        .send({ message: 'User not found in database' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

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
          res.status(httpStatus.OK).send({ token: token, role: user.role });
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
