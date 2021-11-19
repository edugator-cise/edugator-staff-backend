import { model, Schema, Document } from 'mongoose';
interface User {
  name: string;
  username: string;
  password: string;
  role: string;
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['Professor', 'TA']
    }
  },
  { collection: 'userModel' }
);

interface IUser extends User, Document {}

const UserModel = model('userModel', userSchema);

export { UserModel, IUser };
