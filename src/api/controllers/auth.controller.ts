import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';
import * as bcrypt from 'bcrypt';

//TODO: write tests for this
const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // console.log("Role: ", res.locals.role);
    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    };

    if(!req.body.username || !req.body.password || !req.body.role){
      throw { message: 'This route requires a username, password, and role field to be passed in the body' };
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
            const user = await UserModel.create({
              username: req.body.username,
              password: hash,
              role: req.body.role
            });
            res.status(200).send(
              JSON.stringify({
                id: user._id
              })
            );
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

// const checkHash = (plainText, hashedValue) => {
//   bcrypt.compare(plainText, hashedValue, function(_err, result){
//     if (result) {
//       console.log("Passed in value matches the passed in hash!")
//     }
//     else {
//       console.log("Does NOT match passed in hash!");
//     }
//   });
// }

//TODO: Write tests for this
const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = {
      username: req.body.username
    };

    const user: IUser = await UserModel.findOne(payload);

    // Compares the passed in password to the hashed password in the collection
    bcrypt.compare(req.body.password, user.password, function (_err, result) {
      try{
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
      }catch(err){
        res.status(400).type('json').send(err);
      }
    });
  } catch (err) {
    // logger error
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

export { authenticateUser, createUser };
