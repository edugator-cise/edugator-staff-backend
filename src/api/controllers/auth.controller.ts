import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { jwtSecret, jwtExpirationInterval } from '../../config/vars';
// import bcrypt from 'bcrypt';
import * as bcrypt from 'bcrypt'

// const hashPasswordAndStore = async (req: Request, res: Response): Promise<void> => {
//     const saltRounds = 10;
//     var pass = req.body.password;

//     //Generate Salt, Hash, and add to collection
//     bcrypt.hash(pass, saltRounds, function(_err, hash) {
//       // returns hash
//       //Compares the passed in password to the hashed result
//       bcrypt.compare(pass, hash, function(_err, result) {
//         // hashedPassword = hash;
//         console.log("Hashed Password: " + hash);
//         if (result) {
//           console.log("It matches!");
//           //TODO Add to collection
//           //TODO: Store into database
//           res.status(httpStatus.OK).send("Successfully hashed");
//         }
//         else {
//           console.log("Invalid password!");
//         }
//       });
//     });

 // bcrypt.compare("foobar", "$2b$10$rKyNYQMNuvyYCzYyfYidXerhNXsFX9AA7C6iRMNdS53lAgqJK6MbC", function(_err, result){
    //   if (result) {
    //     console.log("It matches the stored hash!")
    //   }
    //   else {
    //     console.log("Invalid password!");
    //   }
    // });

// }


const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  try {
  
    const payload = {
      username: req.body.username
      // password: req.body.password
    };
    
    const user: IUser = await UserModel.findOne(payload);
    
    // Compares the passed in password to the hashed password in the collection
    bcrypt.compare(req.body.password, user.password, function(_err, result){
      if (result) {
        console.log("It matches the stored hash!")
        const token = jwt.sign({ username: payload['username'] }, jwtSecret, {
          expiresIn: jwtExpirationInterval
        });
        res.status(httpStatus.OK).send({ token });
      }
      else {
        console.log("Invalid password!");
        throw new Error('Unauthorized');
      }
    });

    //TODO don't user exact password
    // if (user.password !== req.body.password) {
    //   throw new Error('Unauthorized');
    // }

    // const token = jwt.sign({ username: payload['username'] }, jwtSecret, {
    //   expiresIn: jwtExpirationInterval
    // });
    // res.status(httpStatus.OK).send({ token });
  } catch (err) {
    // logger error
    console.log(err);
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
};

export { authenticateUser };
