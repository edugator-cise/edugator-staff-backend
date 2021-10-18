import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';
import * as bcrypt from 'bcrypt'

const createUser = async (req: Request, res: Response): Promise<void> => {

    console.log("Role: ", res.locals.role);

    if(res.locals.role !== 'Professor'){
      res
        .status(403)
        .type('json')
        .send({ message: 'You do not have permission to make this request' });
        return;
    }

    const saltRounds = 10;
    var pass = req.body.password;

    //Generate Salt, Hash, and add to collection
    bcrypt.hash(pass, saltRounds, function(_err, hash) {
      //Compares the passed in password to the hashed result
      bcrypt.compare(pass, hash, async function(_err, result) {
        //Add into collection, if the password hashed properly
        if (result) {
          try{
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
          }catch(err){
              res.status(400).type('json').send(err);
          }
        }
        else {
          console.log("Invalid password!");
        }
      });
    });
}

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


const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
  
    const payload = {
      username: req.body.username,
    };
    
    const user: IUser = await UserModel.findOne(payload);
    
    // Compares the passed in password to the hashed password in the collection
    bcrypt.compare(req.body.password, user.password, function(_err, result){
      if (result) {
        // console.log("It matches the stored hash!")
        const token = jwt.sign({ username: payload['username'], role: user.role }, jwtSecret, {
          expiresIn: jwtExpirationInterval
        });
        res.status(httpStatus.OK).send({ token });
      }
      else {
        // console.log("Invalid password!");
        throw new Error('Unauthorized');
      }
    });
  } catch (err) {
    // logger error
    console.log(err);
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

export { authenticateUser, createUser };
