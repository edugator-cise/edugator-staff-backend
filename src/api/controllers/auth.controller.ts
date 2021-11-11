import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';
import * as bcrypt from 'bcrypt';

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
    users = await UserModel.find().sort({ role: 1 });
    res.status(200).send(users);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const newRole = req.body.role;
  if (res.locals.role !== 'Professor') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  }

  if (newRole !== 'Professor' && newRole !== 'TA') {
    res
      .status(400)
      .type('json')
      .send({ message: 'You cannot set an invalid role' });
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

const updateRole = async (req: Request, res: Response): Promise<void> => {
  const newRole = req.body.role;
  if (res.locals.role !== 'Professor') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  }

  if (newRole !== 'Professor' && newRole !== 'TA') {
    res
      .status(400)
      .type('json')
      .send({ message: 'You cannot set an invalid role' });
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

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    }

    if (!req.body.username || !req.body.password || !req.body.role) {
      throw {
        message:
          'This route requires a username, password, and role field to be passed in the body'
      };
    }

    if (res.locals.role !== 'Professor') {
      res
        .status(403)
        .type('json')
        .send({ message: 'You do not have permission to make this request' });
      return;
    }

    const saltRounds = 10;
    const pass = req.body.password;

    //Generate Salt, Hash, and add to collection
    bcrypt.hash(pass, saltRounds, function (_err, hash) {
      //Compares the passed in password to the hashed result
      bcrypt.compare(pass, hash, async function (_err, result) {
        //Add into collection, if the password hashed properly
        try {
          if (result) {
            const user = new UserModel({
              username: req.body.username,
              password: hash,
              role: req.body.role
            });
            await user.save(function (err) {
              if (err) {
                if (err.code === 11000) {
                  // Duplicate username
                  return res.status(422).send({
                    message: 'This username is already taken'
                  });
                }

                if (err.name === 'ValidationError') {
                  if (err.errors.username.message === 'Invalid Email') {
                    return res.status(422).send({
                      message: 'The email provided is invalid'
                    });
                  }
                }
                // Some other error
                return res.status(422).send(err);
              }

              return res.status(200).send(
                JSON.stringify({
                  id: user._id
                })
              );
            });
          } else {
            throw { message: 'Password hashing failed' };
          }
        } catch (err) {
          res.status(400).type('json').send(err);
        }
      });
    });
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

// Logs the validated user in
const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = {
      username: req.body.username
    };

    const user: IUser = await UserModel.findOne(payload);

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
          throw { message: 'Invalid Password - Unauthorized' };
        }
      } catch (err) {
        res.status(400).type('json').send(err);
      }
    });
  } catch (err) {
    // logger error
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  if (res.locals.role !== 'Professor') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  }

  let user: IUser;
  try {
    user = await UserModel.findOneAndDelete({
      username: req.body.username
    });

    if (!user) {
      res.status(400).type('json').send({
        message: 'User with given username is not found in the database'
      });
    }

    await user.delete();
    res.status(200).type('json').send({ message: 'User successfully deleted' });
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export {
  authenticateUser,
  createUser,
  getUsers,
  updateRole,
  updateUser,
  deleteUser
};
