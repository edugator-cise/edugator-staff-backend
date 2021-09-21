import { model, Schema, Document } from 'mongoose';
// import * as moment from 'moment';
// import { jwtExpirationInterval } from '../../config/vars';
// import APIError from '../middlewares/api-error';
// import httpStatus from 'http-status';

interface User {
  userName: string;
  passWord: string;
}

const userSchema = new Schema<User>({
  userName: {
    type: String,
    required: true
  },
  passWord: {
    type: String,
    required: true
  },
},   { collection: 'userModel'});

interface IUser extends User, Document {}

// userSchema.method({
//   token() {
//     const payload = {
//       exp:  moment().add(jwtExpirationInterval, 'ms').unix(),
//       iat: moment().unix(),
//       sub: this._id
//     }
    
//   }
// })

// userSchema.statics = {
//   async findAndGenerateToken(email: string, password: string) {
//     if (!email) throw new APIError({ 
//       message: 'An email is required to generate a token', 
//       status: httpStatus.BAD_REQUEST, 
//       stack: "", 
//       errors: "" 
//     })
//     const user = await this.findOne({userName: email}).exec()
//     const err = {
//       status: httpStatus.UNAUTHORIZED
//     }
//     if (password && password == this.) {
//       if (user && )
//     }
//   }
// }

const UserModel = model('userModel', userSchema);

export {UserModel, IUser}
