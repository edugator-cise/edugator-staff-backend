import { model, Schema, Document } from 'mongoose';
interface User {
  username: string;
  password: string;
}

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { collection: 'userModel' }
);

interface IUser extends User, Document {}

const UserModel = model('userModel', userSchema);

export { UserModel, IUser };
