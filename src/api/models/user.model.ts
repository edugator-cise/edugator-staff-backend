import { model, Schema, Document } from 'mongoose';
interface User {
  userName: string;
  passWord: string;
}

const userSchema = new Schema<User>(
  {
    userName: {
      type: String,
      required: true
    },
    passWord: {
      type: String,
      required: true
    }
  },
  { collection: 'userModel' }
);

interface IUser extends User, Document {}

const UserModel = model('userModel', userSchema);

export { UserModel, IUser };
