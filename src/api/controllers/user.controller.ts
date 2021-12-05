import { Request, Response } from 'express';
import { UserModel, IUser } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import userValidation from '../validation/user.validation';
import canUpdate from '../validation/adminAccounts.valiation';

const getUsers = async (_req: Request, res: Response): Promise<void> => {
  // TODO: Do we want TA's to be able to see all people's accounts
  // if (res.locals.role !== 'Professor') {
  //   res
  //     .status(403)
  //     .type('json')
  //     .send({ message: 'You do not have permission to make this request' });
  //   return;
  // }

  let users: IUser[];
  try {
    // Find All user with non Administrator role
    // UserModel.find({ role: { $ne: 'Administrator' } })
    // m = { "$match" : { "enumField" : { "$in" : enumOrder } } };
    // let enumOrder = ['Administrator', 'Professor', 'TA'];
    // .match({ role: { $in: enumOrder } });
    // UserModel.aggregate([
    //   {
    //     $project: {
    //       _id: 1,
    //       name: 1,
    //       username: 1,
    //       order: {
    //         $cond: {
    //           if: { $eq: ['$role', 'Administrator'] },
    //           then: 1,
    //           else: {
    //             $cond: {
    //               if: { $eq: ['$role', 'Professor'] },
    //               then: 2,
    //               else: 3
    //             }
    //           }
    //         }
    //       }
    //     }
    //   },
    //   { $sort: { order: 1 } },
    //   { $project: { _id: 1, task: 1, status: 1 } }
    // ]);

    users = await UserModel.find().select('-password');

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
    if (!validator.isMongoId(req.body._id)) {
      res.status(400).send('This route requires a valid user ID');
      return;
    }

    // let user: IUser;
    let tempUser: IUser;
    // Find the user by ID
    const user = await UserModel.findOne({
      _id: req.body._id
    }).select('-password');

    // If the user is found
    if (user) {
      // This checks if the requester can make edits to the role in the body
      if (
        !canUpdate(
          res.locals.role,
          res.locals.username,
          user.role,
          user.username
        )
      ) {
        res.status(403).send({
          message: 'You do not have access to make edits to that user'
        });
        return;
      }

      // Confirm they are modifying the username
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
      // If a professor is trying to promote a user up to Administrator, throw error
      if (
        req.body.role === 'Administrator' &&
        res.locals.role !== 'Administrator'
      ) {
        res.status(403).send({
          message: 'You cannot promote the role of a user to Administrator'
        });
        return;
      }
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

    // if (res.locals.role !== 'Professor') {
    //   res
    //     .status(403)
    //     .type('json')
    //     .send({ message: 'You do not have permission to make this request' });
    //   return;
    // }

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
                if (err.code === 11000) {
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
  // if (res.locals.role !== 'Professor') {
  //   res
  //     .status(403)
  //     .type('json')
  //     .send({ message: 'You do not have permission to make this request' });
  //   return;
  // }

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
