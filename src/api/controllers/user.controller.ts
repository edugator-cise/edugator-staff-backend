import { Request, Response } from 'express';
import { UserModel, IUser } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import userValidation from '../validation/user.validation';
import { isMongoId } from '../../util';
const getUsers = async (_req: Request, res: Response): Promise<void> => {
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

  try {
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

    // Check to make sure ID is a valid mongoID
    if (!isMongoId(req.body._id)) {
      res.status(400).send('This route requires a valid user ID');
      return;
    }

    // let user: IUser;
    let tempUser: IUser;
    // Find the user by ID
    const user = await UserModel.findOne({
      _id: req.body._id
    }).select('-password');

    // Confirm they are modifying the username
    if (user) {
      if (user.username !== req.body.username) {
        // If modifying, make sure the username is not taken by anyone else
        tempUser = await UserModel.findOne({
          username: req.body.username
        });

        // If taken, then send an error
        if (tempUser) {
          res.status(403).send({
            message: 'This username is already taken'
          });
          return;
        }
      }

      // Find the user again and update
      user.username = req.body.username;
      user.name = req.body.name;
      user.role = req.body.role;
      user.save();
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

    //Joi Validation
    const { error } = userValidation(req.body, false);

    if (error) {
      const errorMessage = error.details[0].message;
      const errorMessageNoQuotes = errorMessage.replace(/["]+/g, '');
      res.status(400).type('json').send({
        message: errorMessageNoQuotes
      });
      return;
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
              name: req.body.name,
              username: req.body.username,
              password: hash,
              role: req.body.role
            });
            await user.save(function (err) {
              if (err) {
                // Monogo DB error
                if ((err as any).code === 11000) {
                  // Duplicate username
                  return res.status(403).send({
                    message: 'This username is already taken'
                  });
                }
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
      return;
    }

    await user.delete();
    res.status(200).type('json').send({ message: 'User successfully deleted' });
    return;
  } catch (err) {
    res.status(400).type('json').send(err);
    return;
  }
};

export { createUser, getUsers, updateUser, deleteUser };
