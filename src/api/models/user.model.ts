import mongoose, { Schema } from 'mongoose';

interface User {
  userName: string;
  passWord: string;
}

const userSchema = new Schema({
  userName: {
    type: String,
    required: true
  },
  passWord: {
    type: String,
    required: true
  }
});

const UserModel = mongoose.model<User>('userModel', userSchema);

export default UserModel;
